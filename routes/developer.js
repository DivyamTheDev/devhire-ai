const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');
const developerController = require('../controllers/developerController');
const upload = require('../services/uploadService');

// Middleware to check if user is a developer
const isDeveloper = (req, res, next) => {
    if (req.user.role === 'developer') {
        return next();
    }
    req.flash('error_msg', 'Access denied. Developer role required.');
    res.redirect('/dashboard');
};

// @route   GET /developer/profile
// @desc    Get current developer profile
router.get('/profile', ensureAuthenticated, isDeveloper, developerController.getProfile);

// @route   POST /developer/profile
// @desc    Create or update profile
router.post('/profile', ensureAuthenticated, isDeveloper, upload.single('resume'), developerController.postProfile);

// @route   POST /developer/evaluate
// @desc    Evaluate profile using AI
router.post('/evaluate', ensureAuthenticated, isDeveloper, developerController.evaluateProfile);

// @route   POST /developer/apply/:jobId
// @desc    Apply for a job
router.post('/apply/:jobId', ensureAuthenticated, isDeveloper, developerController.applyJob);

// @route   GET /developer/applications
// @desc    Get all applications
router.get('/applications', ensureAuthenticated, isDeveloper, developerController.getApplications);

module.exports = router;
