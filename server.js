// npm install express  <-  only run if 'node server.js' won't run;   err code: 'MODULE_NOT_FOUND'
//                          or if you can't see a folder named 'node_modules' inside backend folder
// npm install express-session
// 
// For Git (bash)
//
// cd "/c/Users/My PC/Documents/GitHub/academic_consultation_system"
//
// mkdir -p cert  -- if cert folder doesn't exist
//
// openssl req -nodes -new -x509 -keyout cert/server.key -out cert/server.cert -days 365  -- this creates server.key and server.cert
//
// node server.js

// ----- START OF SERVER.JS -----
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
    cookie: { secure: true }
}));

// Serve frontend static files
app.use('/login', express.static(path.join(__dirname, 'frontend', 'login')));
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
const classListRoute = require("./routes/class-list");

app.use('/api/consultation', consultationRoutes);
app.use('/api/users', usersRoute);
app.use('/', authRoute);
app.use('/api/faculty-availability', facultyAvailabilityRoutes);
app.use('/api/getuser', getUserRoutes);
app.use('/api/setuser', setUserRoutes);
app.use('/api/classes', classManagementRoutes);
app.use('/api/courses', coursesRoute);
app.use("/api/class-list", classListRoute);

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login', 'login.html'));
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
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}/login`);
});
// ----- END OF SERVER.JS -----