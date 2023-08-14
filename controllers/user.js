const User = require('../models/user');

const renderRegister = (req, res) => {
    res.render('users/register');
};

const register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to College Quest!');
            res.redirect('/colleges');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
};

const renderLogin = (req, res) => {
    res.render('users/login');
};

const login =  (req, res) => {
    req.flash('success', 'welcome back!');
    // const redirectUrl = req.session.returnTo || '/campgrounds';
    // delete req.session.returnTo;
    res.redirect('/colleges');
};

const logout = (req, res,next) => {

    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/');
    });
};

module.exports = {renderLogin, renderRegister, register, login, logout};
