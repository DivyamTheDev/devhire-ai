const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register Page
router.get('/register', authController.getRegister);

// Login Page
router.get('/login', authController.getLogin);

// Register Handle
router.post('/register', authController.postRegister);

// Login Handle
router.post('/login', authController.postLogin);

// Logout Handle
router.get('/logout', authController.getLogout);

module.exports = router;
