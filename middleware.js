
module.exports.isLoggedIn = (req, res, next) => {
    // Helper function from passport with session
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // Where user wanted to go initially
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next()
}