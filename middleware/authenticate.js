const { activeTokens } = require('../data/store');

// Hilfsfunktion: Token aus dem Authorization-Header lesen
// Erwartet das Format: "Authorization: Bearer <token>"
function getTokenFromHeader(req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.split(' ')[1];
}

// Middleware: Prüft ob ein gültiges Token mitgeschickt wurde.
// Wird als zweiter Parameter vor alle /tasks Routen gehängt.
// Wenn das Token fehlt oder ungültig ist, bricht die Anfrage mit 401 ab.
// Wenn das Token gültig ist, wird next() aufgerufen und Express geht weiter.
function authenticate(req, res, next) {
    const token = getTokenFromHeader(req);
    if (!token || !activeTokens.has(token)) {
        return res.status(401).json({ message: "Nicht autorisiert. Bitte zuerst einloggen." });
    }
    next();
}

module.exports = { authenticate, getTokenFromHeader };
