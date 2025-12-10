const express = require('express');
const session = require('express-session');
const path = require('path');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SQLite database
const db = new Database('./data.db');

// Create courses table
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    uuid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT
  )
`);

// Seed data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM courses').get();
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO courses (uuid, name, description, short_description) VALUES (?, ?, ?, ?)');
  insert.run(uuidv4(), 'Úvod do programování', 'Tento kurz vás provede základy programování. Naučíte se proměnné, cykly, podmínky a funkce.', 'Základy programování pro začátečníky');
  insert.run(uuidv4(), 'Webový vývoj', 'Kompletní kurz webového vývoje zahrnující HTML, CSS a JavaScript.', 'HTML, CSS a JavaScript');
  insert.run(uuidv4(), 'Databáze a SQL', 'Naučte se pracovat s relačními databázemi a psát SQL dotazy.', 'Práce s relačními databázemi');
  console.log('Database seeded with sample courses');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'tda26-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
}

// Helper to format course for API response
function formatCourse(course) {
  return {
    uuid: course.uuid,
    name: course.name,
    description: course.description || '',
    shortDescription: course.short_description || '',
    materials: [],
    quizzes: [],
    feed: []
  };
}

// ============ API ROUTES ============

// GET /api - Phase 0 requirement
app.get('/api', (req, res) => {
  res.json({ organization: 'Student Cyber Games' });
});

// GET /api/courses - list all courses
app.get('/api/courses', (req, res) => {
  const courses = db.prepare('SELECT * FROM courses').all();
  res.json(courses.map(formatCourse));
});

// POST /api/courses - create new course
app.post('/api/courses', (req, res) => {
  const { name, description, shortDescription } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const uuid = uuidv4();
  db.prepare('INSERT INTO courses (uuid, name, description, short_description) VALUES (?, ?, ?, ?)')
    .run(uuid, name, description || '', shortDescription || '');
  
  const course = db.prepare('SELECT * FROM courses WHERE uuid = ?').get(uuid);
  res.status(201).json(formatCourse(course));
});

// GET /api/courses/:uuid - get single course
app.get('/api/courses/:uuid', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE uuid = ?').get(req.params.uuid);
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  res.json(formatCourse(course));
});

// PUT /api/courses/:uuid - update course
app.put('/api/courses/:uuid', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE uuid = ?').get(req.params.uuid);
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  const { name, description, shortDescription } = req.body;
  
  db.prepare('UPDATE courses SET name = ?, description = ?, short_description = ? WHERE uuid = ?')
    .run(
      name !== undefined ? name : course.name,
      description !== undefined ? description : course.description,
      shortDescription !== undefined ? shortDescription : course.short_description,
      req.params.uuid
    );
  
  const updated = db.prepare('SELECT * FROM courses WHERE uuid = ?').get(req.params.uuid);
  res.json(formatCourse(updated));
});

// DELETE /api/courses/:uuid - delete course
app.delete('/api/courses/:uuid', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE uuid = ?').get(req.params.uuid);
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  db.prepare('DELETE FROM courses WHERE uuid = ?').run(req.params.uuid);
  res.status(204).send();
});

// ============ PAGE ROUTES ============

// GET / - Home page with Hello TdA
app.get('/', (req, res) => {
  res.render('home', { user: req.session.user });
});

// GET /courses - List all courses
app.get('/courses', (req, res) => {
  const search = req.query.search || '';
  let courses;
  
  if (search) {
    courses = db.prepare('SELECT * FROM courses WHERE name LIKE ?').all(`%${search}%`);
  } else {
    courses = db.prepare('SELECT * FROM courses').all();
  }
  
  res.render('courses', { courses, search, user: req.session.user });
});

// GET /courses/:uuid - Course detail
app.get('/courses/:uuid', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE uuid = ?').get(req.params.uuid);
  
  if (!course) {
    return res.status(404).render('error', { message: 'Kurz nenalezen', user: req.session.user });
  }
  
  res.render('course-detail', { course, user: req.session.user });
});

// GET /login - Login page
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null, user: null });
});

// POST /login - Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'lecturer' && password === 'TdA26!') {
    req.session.user = { username: 'lecturer', role: 'lecturer' };
    return res.redirect('/dashboard');
  }
  
  res.render('login', { error: 'Nesprávné přihlašovací údaje', user: null });
});

// GET /logout - Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// GET /dashboard - Dashboard (protected)
app.get('/dashboard', requireAuth, (req, res) => {
  const courses = db.prepare('SELECT * FROM courses').all();
  res.render('dashboard', { courses, user: req.session.user });
});

// POST /dashboard/courses - Create course from dashboard
app.post('/dashboard/courses', requireAuth, (req, res) => {
  const { name, description, shortDescription } = req.body;
  
  if (name) {
    const uuid = uuidv4();
    db.prepare('INSERT INTO courses (uuid, name, description, short_description) VALUES (?, ?, ?, ?)')
      .run(uuid, name, description || '', shortDescription || '');
  }
  
  res.redirect('/dashboard');
});

// POST /dashboard/courses/:uuid/delete - Delete course from dashboard
app.post('/dashboard/courses/:uuid/delete', requireAuth, (req, res) => {
  db.prepare('DELETE FROM courses WHERE uuid = ?').run(req.params.uuid);
  res.redirect('/dashboard');
});

// POST /dashboard/courses/:uuid/edit - Edit course from dashboard
app.post('/dashboard/courses/:uuid/edit', requireAuth, (req, res) => {
  const { name, description, shortDescription } = req.body;
  
  db.prepare('UPDATE courses SET name = ?, description = ?, short_description = ? WHERE uuid = ?')
    .run(name, description || '', shortDescription || '', req.params.uuid);
  
  res.redirect('/dashboard');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
