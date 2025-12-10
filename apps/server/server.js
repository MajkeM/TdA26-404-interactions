const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Uploads directory
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed file types and max size (30MB)
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mp3'];
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format'), false);
    }
  }
});

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

// Create materials table
db.exec(`
  CREATE TABLE IF NOT EXISTS materials (
    uuid TEXT PRIMARY KEY,
    course_uuid TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT,
    file_path TEXT,
    file_name TEXT,
    file_size INTEGER,
    mime_type TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_uuid) REFERENCES courses(uuid) ON DELETE CASCADE
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

// API Auth middleware (returns 401 instead of redirect)
function requireApiAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

// Helper to format material for API response
function formatMaterial(material) {
  const result = {
    uuid: material.uuid,
    name: material.name,
    description: material.description || '',
    type: material.type,
    createdAt: material.created_at
  };
  
  if (material.type === 'file') {
    result.content = `/uploads/${path.basename(material.file_path)}`;
    result.fileName = material.file_name;
    result.fileSize = material.file_size;
    result.mimeType = material.mime_type;
  } else {
    result.content = material.url;
  }
  
  return result;
}

// Helper to format course for API response
function formatCourse(course) {
  const materials = db.prepare('SELECT * FROM materials WHERE course_uuid = ? ORDER BY created_at DESC').all(course.uuid);
  
  return {
    uuid: course.uuid,
    name: course.name,
    description: course.description || '',
    shortDescription: course.short_description || '',
    materials: materials.map(formatMaterial),
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
  
  // Delete associated materials files
  const materials = db.prepare('SELECT * FROM materials WHERE course_uuid = ?').all(req.params.uuid);
  materials.forEach(m => {
    if (m.file_path && fs.existsSync(m.file_path)) {
      fs.unlinkSync(m.file_path);
    }
  });
  
  db.prepare('DELETE FROM materials WHERE course_uuid = ?').run(req.params.uuid);
  db.prepare('DELETE FROM courses WHERE uuid = ?').run(req.params.uuid);
  res.status(204).send();
});

// ============ MATERIALS API ROUTES ============

// Serve uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// GET /api/courses/:uuid/materials - list materials for a course
app.get('/api/courses/:uuid/materials', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE uuid = ?').get(req.params.uuid);
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  const materials = db.prepare('SELECT * FROM materials WHERE course_uuid = ? ORDER BY created_at DESC').all(req.params.uuid);
  res.json(materials.map(formatMaterial));
});

// POST /api/courses/:uuid/materials - create material (protected)
app.post('/api/courses/:uuid/materials', requireApiAuth, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 30MB.' });
      }
      if (err.message === 'Unsupported file format') {
        return res.status(400).json({ error: 'Unsupported file format' });
      }
      return res.status(400).json({ error: err.message });
    }
    
    const course = db.prepare('SELECT * FROM courses WHERE uuid = ?').get(req.params.uuid);
    
    if (!course) {
      // Clean up uploaded file if course not found
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const { name, description, type, url } = req.body;
    
    if (!name) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (!type || !['file', 'link'].includes(type)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Type must be "file" or "link"' });
    }
    
    if (type === 'link' && !url) {
      return res.status(400).json({ error: 'URL is required for link type' });
    }
    
    if (type === 'file' && !req.file) {
      return res.status(400).json({ error: 'File is required for file type' });
    }
    
    const materialUuid = uuidv4();
    
    if (type === 'file') {
      db.prepare(`
        INSERT INTO materials (uuid, course_uuid, type, name, description, file_path, file_name, file_size, mime_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        materialUuid,
        req.params.uuid,
        'file',
        name,
        description || '',
        req.file.path,
        req.file.originalname,
        req.file.size,
        req.file.mimetype
      );
    } else {
      db.prepare(`
        INSERT INTO materials (uuid, course_uuid, type, name, description, url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        materialUuid,
        req.params.uuid,
        'link',
        name,
        description || '',
        url
      );
    }
    
    const material = db.prepare('SELECT * FROM materials WHERE uuid = ?').get(materialUuid);
    res.status(201).json(formatMaterial(material));
  });
});

// GET /api/courses/:courseUuid/materials/:materialUuid - get single material
app.get('/api/courses/:courseUuid/materials/:materialUuid', (req, res) => {
  const material = db.prepare('SELECT * FROM materials WHERE uuid = ? AND course_uuid = ?')
    .get(req.params.materialUuid, req.params.courseUuid);
  
  if (!material) {
    return res.status(404).json({ error: 'Material not found' });
  }
  
  res.json(formatMaterial(material));
});

// PUT /api/courses/:courseUuid/materials/:materialUuid - update material (protected)
app.put('/api/courses/:courseUuid/materials/:materialUuid', requireApiAuth, (req, res) => {
  const material = db.prepare('SELECT * FROM materials WHERE uuid = ? AND course_uuid = ?')
    .get(req.params.materialUuid, req.params.courseUuid);
  
  if (!material) {
    return res.status(404).json({ error: 'Material not found' });
  }
  
  const { name, description, url } = req.body;
  
  if (material.type === 'link') {
    db.prepare('UPDATE materials SET name = ?, description = ?, url = ? WHERE uuid = ?')
      .run(
        name !== undefined ? name : material.name,
        description !== undefined ? description : material.description,
        url !== undefined ? url : material.url,
        req.params.materialUuid
      );
  } else {
    db.prepare('UPDATE materials SET name = ?, description = ? WHERE uuid = ?')
      .run(
        name !== undefined ? name : material.name,
        description !== undefined ? description : material.description,
        req.params.materialUuid
      );
  }
  
  const updated = db.prepare('SELECT * FROM materials WHERE uuid = ?').get(req.params.materialUuid);
  res.json(formatMaterial(updated));
});

// DELETE /api/courses/:courseUuid/materials/:materialUuid - delete material (protected)
app.delete('/api/courses/:courseUuid/materials/:materialUuid', requireApiAuth, (req, res) => {
  const material = db.prepare('SELECT * FROM materials WHERE uuid = ? AND course_uuid = ?')
    .get(req.params.materialUuid, req.params.courseUuid);
  
  if (!material) {
    return res.status(404).json({ error: 'Material not found' });
  }
  
  // Delete file if it's a file type
  if (material.type === 'file' && material.file_path && fs.existsSync(material.file_path)) {
    fs.unlinkSync(material.file_path);
  }
  
  db.prepare('DELETE FROM materials WHERE uuid = ?').run(req.params.materialUuid);
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
  
  const materials = db.prepare('SELECT * FROM materials WHERE course_uuid = ? ORDER BY created_at DESC').all(req.params.uuid);
  res.render('course-detail', { course, materials, user: req.session.user });
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

// GET /dashboard/courses/:uuid - Course detail in dashboard
app.get('/dashboard/courses/:uuid', requireAuth, (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE uuid = ?').get(req.params.uuid);
  
  if (!course) {
    return res.redirect('/dashboard');
  }
  
  const materials = db.prepare('SELECT * FROM materials WHERE course_uuid = ? ORDER BY created_at DESC').all(req.params.uuid);
  res.render('dashboard-course', { course, materials, user: req.session.user });
});

// POST /dashboard/courses/:uuid/materials - Add material from dashboard
app.post('/dashboard/courses/:uuid/materials', requireAuth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      // Redirect back with error - simplified for now
      return res.redirect(`/dashboard/courses/${req.params.uuid}?error=upload`);
    }
    
    const course = db.prepare('SELECT * FROM courses WHERE uuid = ?').get(req.params.uuid);
    if (!course) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.redirect('/dashboard');
    }
    
    const { name, description, type, url } = req.body;
    
    if (!name || !type) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.redirect(`/dashboard/courses/${req.params.uuid}?error=validation`);
    }
    
    const materialUuid = uuidv4();
    
    if (type === 'file' && req.file) {
      db.prepare(`
        INSERT INTO materials (uuid, course_uuid, type, name, description, file_path, file_name, file_size, mime_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        materialUuid,
        req.params.uuid,
        'file',
        name,
        description || '',
        req.file.path,
        req.file.originalname,
        req.file.size,
        req.file.mimetype
      );
    } else if (type === 'link' && url) {
      db.prepare(`
        INSERT INTO materials (uuid, course_uuid, type, name, description, url)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        materialUuid,
        req.params.uuid,
        'link',
        name,
        description || '',
        url
      );
    }
    
    res.redirect(`/dashboard/courses/${req.params.uuid}`);
  });
});

// POST /dashboard/courses/:uuid/materials/:materialUuid/delete - Delete material
app.post('/dashboard/courses/:uuid/materials/:materialUuid/delete', requireAuth, (req, res) => {
  const material = db.prepare('SELECT * FROM materials WHERE uuid = ? AND course_uuid = ?')
    .get(req.params.materialUuid, req.params.uuid);
  
  if (material) {
    if (material.type === 'file' && material.file_path && fs.existsSync(material.file_path)) {
      fs.unlinkSync(material.file_path);
    }
    db.prepare('DELETE FROM materials WHERE uuid = ?').run(req.params.materialUuid);
  }
  
  res.redirect(`/dashboard/courses/${req.params.uuid}`);
});

// POST /dashboard/courses/:uuid/materials/:materialUuid/edit - Edit material
app.post('/dashboard/courses/:uuid/materials/:materialUuid/edit', requireAuth, (req, res) => {
  const { name, description, url } = req.body;
  const material = db.prepare('SELECT * FROM materials WHERE uuid = ? AND course_uuid = ?')
    .get(req.params.materialUuid, req.params.uuid);
  
  if (material) {
    if (material.type === 'link') {
      db.prepare('UPDATE materials SET name = ?, description = ?, url = ? WHERE uuid = ?')
        .run(name || material.name, description || '', url || material.url, req.params.materialUuid);
    } else {
      db.prepare('UPDATE materials SET name = ?, description = ? WHERE uuid = ?')
        .run(name || material.name, description || '', req.params.materialUuid);
    }
  }
  
  res.redirect(`/dashboard/courses/${req.params.uuid}`);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
