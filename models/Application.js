const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    developer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'shortlisted', 'rejected', 'accepted'],
        default: 'pending'
    },

    // 🔥 AI fields
    aiScore: Number,
    aiFeedback: String,
    aiSummary: String,

    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Application', ApplicationSchema);