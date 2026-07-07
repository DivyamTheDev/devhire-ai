const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');

// Get recruiter dashboard
exports.getDashboard = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
        res.render('recruiter/dashboard', {
            title: 'Recruiter Dashboard',
            jobs
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Post a new job
exports.postJob = async (req, res) => {
    const { title, company, description, skillsRequired, experienceRequired } = req.body;
    
    try {
        const newJob = new Job({
            postedBy: req.user.id,
            title,
            company,
            description,
            skillsRequired: skillsRequired.split(',').map(s => s.trim()),
            experienceRequired
        });

        await newJob.save();
        req.flash('success_msg', 'Job posted successfully');
        res.redirect('/recruiter/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Candidate Discovery
exports.getCandidates = async (req, res) => {
    try {
        const candidates = await User.find({ role: 'developer' }).sort({ aiScore: -1 });
        res.render('recruiter/candidates', {
            title: 'Candidate Discovery',
            candidates
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// View applicants for a job
exports.getApplicants = async (req, res) => {
    try {
        const applications = await Application.find({ job: req.params.jobId })
            .populate('developer', 'name email skills aiScore aiSummary experience resumeUrl')
            .sort({ matchScore: -1 });
        
        const job = await Job.findById(req.params.jobId);

        res.render('recruiter/applicants', {
            title: 'Job Applicants',
            applications,
            job
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};