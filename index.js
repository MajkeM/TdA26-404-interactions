const express = require('express');
const app = express();

// Načtení portu z prostředí (nutnost pro TdA), jinak 3000
const PORT = process.env.PORT || 3000;

// Middleware pro logování - abychom viděli, že tam request dorazil
app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} request na: ${req.url}`);
    next();
});

// --- ZADÁNÍ 1: Hlavní stránka "/" ---
// Test očekává "Hello TdA" a content-type text/html
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <body>
            <h1>Hello TdA</h1>
        </body>
        </html>
    `);
});

// --- ZADÁNÍ 2: API "/api" ---
// Test volá "/api/" (s lomítkem na konci).
// Express by default bere '/api' jako '/api' i '/api/', ale pro jistotu:
app.get('/api', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ organization: "Student Cyber Games" });
});

// Spuštění serveru
// DŮLEŽITÉ: '0.0.0.0' je nutné pro Docker
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[START] Aplikace běží na portu ${PORT} a hostu 0.0.0.0`);
});