const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

// Log each request
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send('<!doctype html><html><head><meta charset="utf-8"><title>TdA</title></head><body><h1>Hello TdA</h1></body></html>');
});

app.get('/api', (req, res) => {
  res.json({ organization: 'Student Cyber Games' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});

module.exports = app;
