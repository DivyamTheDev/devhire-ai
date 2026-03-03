const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');
const recruiterController = require('../controllers/recruiterController');

// Middleware to check if user is a recruiter
const isRecruiter = (req, res, next) => {
    if (req.user.role === 'recruiter') {
        return next();
    }
    req.flash('error_msg', 'Access denied. Recruiter role required.');
    res.redirect('/dashboard');
};

// @route   GET /recruiter/dashboard
// @desc    Get recruiter dashboard
router.get('/dashboard', ensureAuthenticated, isRecruiter, recruiterController.getDashboard);

// @route   POST /recruiter/post-job
// @desc    Post a new job
router.post('/post-job', ensureAuthenticated, isRecruiter, recruiterController.postJob);

// @route   GET /recruiter/candidates
// @desc    Candidate Discovery
router.get('/candidates', ensureAuthenticated, isRecruiter, recruiterController.getCandidates);

// @route   GET /recruiter/applicants/:jobId
// @desc    View applicants for a job
router.get('/applicants/:jobId', ensureAuthenticated, isRecruiter, recruiterController.getApplicants);

module.exports = router;
