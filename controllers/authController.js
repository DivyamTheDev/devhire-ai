const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

// Register Page
exports.getRegister = (req, res) => res.render('auth/register', { 
    title: 'Register',
    role: req.query.role || 'developer'
});

// Login Page
exports.getLogin = (req, res) => res.render('auth/login', { title: 'Login' });

// Register Handle
exports.postRegister = async (req, res) => {
    const { name, email, password, confirmPassword, role } = req.body;
    let errors = [];

    if (!name || !email || !password || !confirmPassword || !role) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password !== confirmPassword) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('auth/register', {
            errors,
            name,
            email,
            password,
            confirmPassword,
            role,
            title: 'Register'
        });
    } else {
        try {
            const user = await User.findOne({ email: email });
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('auth/register', {
                    errors,
                    name,
                    email,
                    password,
                    confirmPassword,
                    role,
                    title: 'Register'
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password,
                    role
                });

                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        console.error('Salt error:', err);
                        return res.render('auth/register', { errors: [{ msg: 'Security error' }], ...req.body, title: 'Register' });
                    }
                    bcrypt.hash(newUser.password, salt, async (err, hash) => {
                        if (err) {
                            console.error('Hash error:', err);
                            return res.render('auth/register', { errors: [{ msg: 'Security error' }], ...req.body, title: 'Register' });
                        }
                        newUser.password = hash;
                        try {
                            await newUser.save();
                            req.flash(
                                'success_msg',
                                'You are now registered and can log in'
                            );
                            res.redirect('/auth/login');
                        } catch (err) {
                            console.error('Save error:', err);
                            res.render('auth/register', { errors: [{ msg: 'Server error during save' }], ...req.body, title: 'Register' });
                        }
                    });
                });
            }
        } catch (err) {
            console.error(err);
            res.render('auth/register', { errors: [{ msg: 'Database error' }], ...req.body, title: 'Register' });
        }
    }
};

// Login Handle
exports.postLogin = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
};

// Logout Handle
exports.getLogout = (req, res, next) => {
    req.logout(err => {
        if (err) { return next(err); }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/auth/login');
    });
};
