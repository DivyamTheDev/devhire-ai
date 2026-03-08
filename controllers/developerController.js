const User = require('../models/User');
const Application = require('../models/Application');
const aiService = require('../services/aiService');
const path = require('path');


// Get current developer profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.render('developer/profile', {
            title: 'My Profile',
            user: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Create or update profile
exports.postProfile = async (req, res) => {
    const { bio, skills, githubUsername, portfolioUrl, experience } = req.body;
    
    // Build profile object
    const updateFields = {};
    if (bio) updateFields.bio = bio;
    if (githubUsername) updateFields.githubUsername = githubUsername;
    if (portfolioUrl) updateFields.portfolioUrl = portfolioUrl;
    if (experience) updateFields.experience = experience;
    if (skills) {
        updateFields.skills = skills.split(',').map(skill => skill.trim());
    }

  if (req.file) {

    const resumePath = path.join(
        __dirname,
        "../public/uploads/resumes/",
        req.file.filename
    );

    const analysis = await aiService.analyzeResume(resumePath);

    updateFields.resumeUrl = '/uploads/resumes/' + req.file.filename;
    updateFields.aiScore = analysis.score;
    updateFields.aiSummary = analysis.summary;
}

    try {
        await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        );
        req.flash('success_msg', 'Profile updated');
        res.redirect('/developer/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Evaluate profile using AI
exports.evaluateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        const evaluation = await aiService.evaluateProfile({
            name: user.name,
            bio: user.bio,
            skills: user.skills,
            githubUsername: user.githubUsername,
            experience: user.experience
        });

        user.aiScore = evaluation.score;
        // In real app, we might store feedback elsewhere or as a separate field, 
        // but for now, we'll follow the User model extension.
        // If we want feedback, let's add aiFeedback to User model too later if needed.
        
        await user.save();
        req.flash('success_msg', `AI evaluation completed! Your score: ${evaluation.score}`);
        res.redirect('/developer/profile');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'AI evaluation failed. Please try again later.');
        res.redirect('/developer/profile');
    }
};
// Apply for a job
exports.applyJob = async (req, res) => {
    try {

        const user = await User.findById(req.user.id);
        const Job = require('../models/Job');

        if (!user.skills || user.skills.length === 0) {
            req.flash('error_msg', 'Please complete your profile before applying');
            return res.redirect('/developer/profile');
        }

        const existingApp = await Application.findOne({
            job: req.params.jobId,
            developer: req.user.id
        });

        if (existingApp) {
            req.flash('error_msg', 'You have already applied for this job');
            return res.redirect('/jobs');
        }

        // 🔥 AI PROFILE EVALUATION
        const aiEvaluation = await aiService.evaluateProfile({
            name: user.name,
            bio: user.bio,
            skills: user.skills,
            githubUsername: user.githubUsername
        });

        // 🔥 AI SUMMARY
        const aiSummary = await aiService.summarizeResume(
            user.skills,
            user.bio
        );

        const newApplication = new Application({
            job: req.params.jobId,
            developer: req.user.id,
           

            // Save AI results
            aiScore: aiEvaluation.score,
            aiFeedback: aiEvaluation.feedback,
            aiSummary: aiSummary
        });

        await newApplication.save();

        req.flash('success_msg', 'Application submitted successfully!');
        res.redirect('/developer/applications');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
// Get all applications for developer
exports.getApplications = async (req, res) => {
    try {
        const applications = await Application.find({ developer: req.user.id })
            .populate('job')
            .sort({ date: -1 });
        res.render('developer/applications', {
            title: 'My Applications',
            applications
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
