const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

// JSON Body-Parser Middleware
app.use(express.json());

// In-Memory Speicher für Tasks
let tasks = [];



// Alle endpoints aufsetzen

// GET / tasks	Gibt eine Liste aller Tasks zurück
app.get('/tasks', (req, res) => {
    res.json(tasks);
});

// POST / tasks	Erstellt einen neuen Task und gibt ihn zurück
app.post("/tasks", (req, res) => {
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

// POST / tasks / { id } / done	Markiert einen Task als erledigt
app.post("/tasks/:id/done", (req, res) => {
    const { id } = req.params;
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({ message: "Task nicht gefunden" });
    }

    // Füllen Sie das Feld completedAt automatisch mit dem aktuellen Datum/Zeit, wenn ein Task als erledigt markiert wird.
    task.completedAt = new Date().toISOString();

    res.json({ message: "Task wurde als erledigt markiert!", task });
});

// GET / tasks / { id }	Gibt einen einzelnen Task anhand der ID zurück
app.get("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({ message: "Task nicht gefunden" });
    }

    res.json(task);
});

// PUT / tasks / { id }	Ersetzt einen bestehenden Task und gibt ihn zurück
app.put("/tasks/:id", (req, res) => {
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

// DELETE / tasks / { id }	Löscht einen bestehenden Task
app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Task nicht gefunden" });
    }

    tasks.splice(index, 1);

    res.status(200).json({ message: "Die Task wurde erfolgreich gelöscht!" });
});

// Attribute für resource task
// id	String	Generierte eindeutige ID
// title	String	Kurzer Titel, der die Aufgabe beschreibt
// description	String	Beschreibung der Aufgabe(optional)
// createdAt	DateTime	Datum / Zeit, wann der Task erstellt wurde
// dueDate	DateTime	Datum / Zeit, bis wann die Aufgabe erledigt sein soll(optional)
// completedAt	DateTime	Datum / Zeit, wann die Aufgabe erfüllt wurde(optional)

app.listen(3000, () => {
    console.log("Server started on http://localhost:3000")
});
