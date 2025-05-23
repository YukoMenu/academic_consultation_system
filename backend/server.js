// npm install express  <-  only run if 'node server.js' won't run;   err code: 'MODULE_NOT_FOUND'
//                          or if you can't see a folder named 'node_modules' inside backend folder
// node server.js

// ----- START OF SERVER.JS -----
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const consultationRoutes = require('./routes/consultation');
const facultyAvailabilityRoutes = require('./routes/faculty-availability');

app.use('/api/consultation', consultationRoutes);
app.use('/users', usersRoute);
app.use('/', authRoute);
app.use('/api/faculty-availability', facultyAvailabilityRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
// ----- END OF SERVER.JS -----