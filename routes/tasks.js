const express = require('express');
const router = express.Router();
const { tasks } = require('../data/store');
const { authenticate } = require('../middleware/authenticate');

// GET /tasks   Gibt eine Liste aller Tasks zurück
router.get('/', authenticate, (req, res) => {
    res.status(200).json(tasks);
});

// POST /tasks   Erstellt einen neuen Task und gibt ihn zurück
router.post('/', authenticate, (req, res) => {
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
// Muss vor GET /tasks/:id stehen, damit Express nicht "done" als ID interpretiert
router.post('/:id/done', authenticate, (req, res) => {
    const { id } = req.params;
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({ message: "Task nicht gefunden" });
    }

    // Füllen Sie das Feld completedAt automatisch mit dem aktuellen Datum/Zeit, wenn ein Task als erledigt markiert wird.
    task.completedAt = new Date().toISOString();

    res.status(200).json({ message: "Task wurde als erledigt markiert!", task });
});

// GET /tasks/:id   Gibt einen einzelnen Task anhand der ID zurück
router.get('/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({ message: "Task nicht gefunden" });
    }

    res.status(200).json(task);
});

// PUT /tasks/:id   Ersetzt einen bestehenden Task und gibt ihn zurück
router.put('/:id', authenticate, (req, res) => {
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

    res.status(200).json({ message: "Task aktualisiert", task });
});

// DELETE /tasks/:id   Löscht einen bestehenden Task
router.delete('/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Task nicht gefunden" });
    }

    tasks.splice(index, 1);

    res.status(200).json({ message: "Die Task wurde erfolgreich gelöscht!" });
});

module.exports = router;
