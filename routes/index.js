const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../middlewares/auth');
const Job = require('../models/Job');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => {
    res.render('index', { title: 'Welcome to DevHire AI' });
});

const User = require('../models/User');
const Application = require('../models/Application');

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        let data = {
            applicationsCount: 0,
            recentApplications: [],
            jobsCount: 0
        };

        if (req.user.role === 'developer') {
            data.applicationsCount = await Application.countDocuments({ developer: req.user.id });
            data.recentApplications = await Application.find({ developer: req.user.id })
                .populate('job')
                .limit(5)
                .sort({ date: -1 });
        } else if (req.user.role === 'recruiter') {
            data.jobsCount = await Job.countDocuments({ postedBy: req.user.id });
            const recruiterJobs = await Job.find({ postedBy: req.user.id }).select('_id');
            const jobIds = recruiterJobs.map(j => j._id);
            data.applicationsCount = await Application.countDocuments({ job: { $in: jobIds } });
        }

        res.render('dashboard', {
            title: 'Dashboard',
            user: req.user,
            ...data
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Browse Jobs (for developers)
router.get('/jobs', ensureAuthenticated, async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.render('jobs', { title: 'Browse Jobs', jobs });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
