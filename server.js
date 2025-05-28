// npm install express  <-  only run if 'node server.js' won't run;   err code: 'MODULE_NOT_FOUND'
//                          or if you can't see a folder named 'node_modules' inside backend folder
// node server.js

// ----- START OF SERVER.JS -----
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use('/login page', express.static(path.join(__dirname, 'frontend', 'login page')));
app.use('/admin', express.static(path.join(__dirname, 'frontend', 'admin')));
app.use('/faculty', express.static(path.join(__dirname, 'frontend', 'faculty')));
app.use('/student', express.static(path.join(__dirname, 'frontend', 'student')));

// API Routes
const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const consultationRoutes = require('./routes/consultation');
const facultyAvailabilityRoutes = require('./routes/faculty-availability');
const getUserRoutes = require('./routes/getuser');
const setUserRoutes = require('./routes/setuser');
const classManagementRoutes = require('./routes/classes');
const coursesRoute = require('./routes/courses');

app.use('/api/consultation', consultationRoutes);
app.use('/api/users', usersRoute);
app.use('/', authRoute);
app.use('/api/faculty-availability', facultyAvailabilityRoutes);
app.use('/api/getuser', getUserRoutes);
app.use('/api/setuser', setUserRoutes);
app.use('/api/classes', classManagementRoutes);
app.use('/api/courses', coursesRoute);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// SPA fallback for sub-apps
app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin', 'index.html'));
});

app.get('/faculty/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'faculty', 'index.html'));
});

app.get('/student/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'student', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('Server is running at http://localhost:${PORT}');
});
// ----- END OF SERVER.JS -----