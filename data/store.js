// Zentraler In-Memory Speicher für die gesamte Applikation.
// Alle Routen greifen auf diese gemeinsamen Objekte zu.

// Liste aller Tasks
let tasks = [];

// Registrierte Benutzer (in einer echten App: Datenbank + gehashte Passwörter)
const users = [
    { email: "admin@example.com", password: "1234" }
];

// Set aller aktiven (eingeloggten) Tokens
// Ein Token wird beim Login hinzugefügt und beim Logout wieder entfernt
const activeTokens = new Set();

module.exports = { tasks, users, activeTokens };
