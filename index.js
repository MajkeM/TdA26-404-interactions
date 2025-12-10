const express = require('express');
const app = express();

// Načtení portu z prostředí, nebo fallback na 3000
const port = process.env.PORT || 3000;

// Logování pro debug (uvidíš v logách kontejneru)
app.use((req, res, next) => {
    console.log(`Příchozí request: ${req.method} ${req.url}`);
    next();
});

// 1. ÚKOL: HTML stránka
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>TdA App</title>
    </head>
    <body>
        <h1>Hello TdA</h1>
    </body>
    </html>
  `);
});

// 2. ÚKOL: API Endpoint
// Express by default bere /api i /api/, ale pro jistotu to ošetříme
app.get('/api', (req, res) => {
    res.json({ organization: "Student Cyber Games" });
});

// Spuštění serveru - DŮLEŽITÉ: '0.0.0.0'
app.listen(port, '0.0.0.0', () => {
    console.log(`Server běží na portu ${port} a poslouchá na 0.0.0.0`);
});