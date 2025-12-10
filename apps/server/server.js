const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// GET / - HTML stránka s "Hello TdA"
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tour de App</title>
</head>
<body>
  <h1>Hello TdA</h1>
  <p>Welcome to Tour de App!</p>
</body>
</html>
  `);
});

// GET /api - JSON s organization
app.get('/api', (req, res) => {
  res.json({ organization: 'Student Cyber Games' });
});

// Spuštění serveru
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
