const express = require('express');
const app = express();

// 1. DŮLEŽITÉ: Port musíme brát z prostředí (TdA server ho tam pošle), jinak 3000
const PORT = process.env.PORT || 3000;

// Logování každého requestu (pomůže ti vidět, co se děje v logách v Tour de Cloud)
app.use((req, res, next) => {
    console.log(`[LOG] Request: ${req.method} ${req.url}`);
    next();
});

// ZADÁNÍ 1: HTML na hlavní stránce
app.get('/', (req, res) => {
    res.send('<!DOCTYPE html><html><body><h1>Hello TdA</h1></body></html>');
});

// ZADÁNÍ 2: API JSON
// Express automaticky zvládne /api i /api/
app.get('/api', (req, res) => {
    res.json({ "organization": "Student Cyber Games" });
});

// 2. DŮLEŽITÉ: '0.0.0.0' zpřístupní aplikaci zvenčí kontejneru
app.listen(PORT, '0.0.0.0', () => {
    console.log(`App running on port ${PORT} and host 0.0.0.0`);
});