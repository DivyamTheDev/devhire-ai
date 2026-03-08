const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['developer', 'recruiter', 'admin'],
        default: 'developer'
    },
    skills: {
        type: [String],
        default: []
    },
    bio: {
        type: String,
        default: ''
    },
    githubUsername: {
        type: String,
        default: ''
    },
    portfolioUrl: {
        type: String,
        default: ''
    },
    experience: {
        type: String,
        default: ''
    },
    resumeUrl: {
        type: String,
        default: ''
    },
    aiScore: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    aiSummary: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('User', UserSchema);
