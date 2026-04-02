const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

// JSON Body-Parser Middleware
app.use(express.json());

// In-Memory Speicher für Tasks
let tasks = [];

// In-Memory Speicher für Benutzer und aktive Tokens
// (Passwörter würden in einer echten App gehasht gespeichert, z.B. mit bcrypt)
const users = [
    { email: "admin@example.com", password: "1234" }
];
const activeTokens = new Set();

// Hilfsfunktion: Token aus dem Authorization-Header lesen
// Erwartet das Format: "Authorization: Bearer <token>"
function getTokenFromHeader(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.split(' ')[1];
}

// Middleware: Prüft ob ein gültiges Token mitgeschickt wurde
// Wird vor alle /tasks Endpunkte gehängt
function authenticate(req, res, next) {
    const token = getTokenFromHeader(req);
    if (!token || !activeTokens.has(token)) {
        return res.status(401).json({ message: "Nicht autorisiert. Bitte zuerst einloggen." });
    }
    next();
}



// Auth Endpunkte aufsetzen

// POST /login   Nimmt Credentials entgegen, prüft sie und gibt ein Token zurück
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ message: "E-Mail und Passwort müssen angegeben werden" });
    }

    // Benutzer anhand von E-Mail und Passwort suchen
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ message: "E-Mail oder Passwort ist falsch" });
    }

    // Token generieren und als aktiv speichern
    const token = crypto.randomUUID();
    activeTokens.add(token);

    res.status(200).json({ message: "Login erfolgreich", token });
});

// GET /verify   Prüft ein Token auf Gültigkeit und gibt das Ergebnis zurück
app.get("/verify", (req, res) => {
    const token = getTokenFromHeader(req);

    if (!token || !activeTokens.has(token)) {
        return res.status(401).json({ message: "Token ist ungültig oder abgelaufen" });
    }

    res.status(200).json({ message: "Token ist gültig" });
});

// DELETE /logout   Markiert das übergebene Token als ungültig
app.delete("/logout", (req, res) => {
    const token = getTokenFromHeader(req);

    // Token aus dem Set entfernen (egal ob es existiert oder nicht)
    activeTokens.delete(token);

    res.status(200).json({ message: "Erfolgreich ausgeloggt" });
});

// Alle Task Endpunkte aufsetzen
// Alle sind mit der authenticate Middleware geschützt

// GET /tasks   Gibt eine Liste aller Tasks zurück
app.get('/tasks', authenticate, (req, res) => {
    res.json(tasks);
});

// POST /tasks   Erstellt einen neuen Task und gibt ihn zurück
app.post("/tasks", authenticate, (req, res) => {
    const { title, description, dueDate } = req.body;

    // Validieren Sie die Eingabe des title-Felds, sodass dieses nicht leer sein kann.
    if (!title || title.trim() === "") {
        return res.status(422).json({ message: "Das Feld 'title' darf nicht leer sein" });
    }

    // Generieren Sie die ID der Tasks automatisch (UUID).
    // Füllen Sie das Feld createdAt automatisch mit dem aktuellen Datum/Zeit, wenn ein Task erstellt wird.
    const neueTask = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description || null,
        createdAt: new Date().toISOString(),
        dueDate: dueDate || null,
        completedAt: null
    };

    tasks.push(neueTask);

    res.status(201).json({ message: "Die Task wurde hinzugefügt!", neueTask });
});

// POST /tasks/:id/done   Markiert einen Task als erledigt
app.post("/tasks/:id/done", authenticate, (req, res) => {
    const { id } = req.params;
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({ message: "Task nicht gefunden" });
    }

    // Füllen Sie das Feld completedAt automatisch mit dem aktuellen Datum/Zeit, wenn ein Task als erledigt markiert wird.
    task.completedAt = new Date().toISOString();

    res.json({ message: "Task wurde als erledigt markiert!", task });
});

// GET /tasks/:id   Gibt einen einzelnen Task anhand der ID zurück
app.get("/tasks/:id", authenticate, (req, res) => {
    const { id } = req.params;
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({ message: "Task nicht gefunden" });
    }

    res.json(task);
});

// PUT /tasks/:id   Ersetzt einen bestehenden Task und gibt ihn zurück
app.put("/tasks/:id", authenticate, (req, res) => {
    const { id } = req.params;
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({ message: "Task nicht gefunden" });
    }

    // Validieren Sie die Eingabe des title-Felds, sodass dieses nicht leer sein kann.
    if (req.body.title !== undefined && req.body.title.trim() === "") {
        return res.status(422).json({ message: "Das Feld 'title' darf nicht leer sein" });
    }

    // id und createdAt dürfen nicht überschrieben werden
    const { id: _id, createdAt: _createdAt, ...updates } = req.body;
    Object.assign(task, updates);

    res.json({ message: "Task aktualisiert", task });
});

// DELETE /tasks/:id   Löscht einen bestehenden Task
app.delete("/tasks/:id", authenticate, (req, res) => {
    const { id } = req.params;
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Task nicht gefunden" });
    }

    tasks.splice(index, 1);

    res.status(200).json({ message: "Die Task wurde erfolgreich gelöscht!" });
});

// Attribute für resource task
// id          String    Generierte eindeutige ID
// title       String    Kurzer Titel, der die Aufgabe beschreibt
// description String    Beschreibung der Aufgabe (optional)
// createdAt   DateTime  Datum / Zeit, wann der Task erstellt wurde
// dueDate     DateTime  Datum / Zeit, bis wann die Aufgabe erledigt sein soll (optional)
// completedAt DateTime  Datum / Zeit, wann die Aufgabe erfüllt wurde (optional)

app.listen(3000, () => {
    console.log("Server started on http://localhost:3000")
});
