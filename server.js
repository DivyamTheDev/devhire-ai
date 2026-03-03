require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const dotenv = require('dotenv');

// Error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Load environment variables
dotenv.config();

const app = express();

// Database connection
try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
    console.log('DNS servers set to 1.1.1.1, 8.8.8.8 for SRV resolution fallback');
} catch (err) {
    console.warn('Could not set DNS servers:', err && err.message ? err.message : err);
}

const dbURI = process.env.MONGODB_URI;
console.log("DEBUG MONGO URI =", dbURI ? '[REDACTED]' : dbURI);
if (dbURI) {
    mongoose.set('strictQuery', false);
    mongoose.connect(dbURI)
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.error('MongoDB Connection Error:', err));

    mongoose.connection.on('connected', () => console.log('Mongoose event: connected'));
    mongoose.connection.on('error', (err) => console.error('Mongoose event: error', err));
    mongoose.connection.on('disconnected', () => console.warn('Mongoose event: disconnected'));
} else {
    console.warn('Warning: MONGODB_URI not found in environment variables');
}

// EJS Setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

// Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Passport Config
require('./config/passport')(passport);

// Express Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'devhire_secret',
    resave: false,
    saveUninitialized: false
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
const flash = require('connect-flash');
app.use(flash());

// Global Variables (for views)
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Logger Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/developer', require('./routes/developer'));
app.use('/recruiter', require('./routes/recruiter'));

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
