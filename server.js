// npm install express  <-  only run if 'node server.js' won't run;   err code: 'MODULE_NOT_FOUND'
//                          or if you can't see a folder named 'node_modules'
// npm install express-session
// 
// For Git (bash)
// cd "/c/Users/My PC/Documents/GitHub/academic_consultation_system"
// mkdir -p cert  -- if cert folder doesn't exist
// openssl req -nodes -new -x509 -keyout cert/server.key -out cert/server.cert -days 365  -- this creates server.key and server.cert
//
// node server.js

// ----- START OF SERVER.JS -----
require('dotenv').config();
const express = require('express');
const session = require("express-session");
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const app = express();
const PORT = 3000;

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'server.cert'))
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }   // secure: process.env.NODE_ENV === "production"
}));

app.use((req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  }
  next();
});

// Serve frontend static files
app.use('/login', express.static(path.join(__dirname, 'frontend', 'login')));
app.use('/admin', express.static(path.join(__dirname, 'frontend', 'admin')));
app.use('/faculty', express.static(path.join(__dirname, 'frontend', 'faculty')));
app.use('/student', express.static(path.join(__dirname, 'frontend', 'student')));
app.use('/data', express.static(path.join(__dirname, 'data')));

// API Routes
const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const consultationRoutes = require('./routes/consultation');
const facultyAvailabilityRoutes = require('./routes/faculty-availability');
const getUserRoutes = require('./routes/getuser');
const setUserRoutes = require('./routes/setuser');
const classManagementRoutes = require('./routes/classes');
const coursesRoute = require('./routes/courses');
const consultationRequestRoutes = require('./routes/consultation-request');
const facultyAppointmentRoutes = require('./routes/faculty-appointment');
const facultyUnavailableRoutes = require('./routes/faculty-unavailable');
const summaryRoute = require('./routes/summary');

app.use('/api/consultation', consultationRoutes);
app.use('/api/users', usersRoute);
app.use('/', authRoute);
app.use('/api/faculty-availability', facultyAvailabilityRoutes);
app.use('/api/getuser', getUserRoutes);
app.use('/api/setuser', setUserRoutes);
app.use('/api/classes', classManagementRoutes);
app.use('/api/courses', coursesRoute);
app.use('/api/consultation-request', consultationRequestRoutes);
app.use('/api/appointment', facultyAppointmentRoutes);
app.use('/api/faculty-unavailable', facultyUnavailableRoutes);
app.use('/api/consultation-form', require('./routes/consultation-form'));
app.use('/api/summary', summaryRoute);

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login', 'login.html'));
});

app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin', 'index.html'));
});

app.get('/faculty/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'faculty', 'index.html'));
});

app.get('/student/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'student', 'index.html'));
});

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}/login`);
});
// ----- END OF SERVER.JS -----