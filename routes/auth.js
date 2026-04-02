const express = require('express');
const router = express.Router();
const { users, activeTokens } = require('../data/store');
const { getTokenFromHeader } = require('../middleware/authenticate');

// POST /login   Nimmt Credentials entgegen, prüft sie und gibt ein Token zurück
router.post("/login", (req, res) => {
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
router.get("/verify", (req, res) => {
    const token = getTokenFromHeader(req);

    if (!token || !activeTokens.has(token)) {
        return res.status(401).json({ message: "Token ist ungültig oder abgelaufen" });
    }

    res.status(200).json({ message: "Token ist gültig" });
});

// DELETE /logout   Markiert das übergebene Token als ungültig
router.delete("/logout", (req, res) => {
    const token = getTokenFromHeader(req);

    // Token aus dem Set entfernen (egal ob es existiert oder nicht)
    activeTokens.delete(token);

    res.status(200).json({ message: "Erfolgreich ausgeloggt" });
});

module.exports = router;
