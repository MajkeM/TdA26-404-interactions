const express = require('express');
const app = express();

// Port se často nastavuje dynamicky prostředím (pro nasazení), jinak 3000
const port = process.env.PORT || 3000;

// 1. ÚKOL: Indexová stránka na kořenové adrese /
// Musí obsahovat text "Hello TdA" a musí to být HTML.
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>TdA App</title>
    </head>
    <body>
        <!-- Text nesmí být v canvasu, dáme ho do nadpisu -->
        <h1>Hello TdA</h1>
    </body>
    </html>
  `);
});

// 2. ÚKOL: API endpoint na adrese /api
// Musí vracet JSON objekt { "organization": "Student Cyber Games" }
app.get('/api', (req, res) => {
  res.json({
    organization: "Student Cyber Games"
  });
});

// Spuštění serveru
app.listen(port, () => {
  console.log(`Aplikace běží na portu ${port}`);
});