const app = require('./app');

// Server starten
app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
    console.log("Swagger UI:   http://localhost:3000/api-docs");
});
