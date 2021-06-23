const User = require("../models/user");


module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register");
};
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};
module.exports.registerNewUser = async (req, res, next) => {
    try {
        const { contact, username, password, college, address } = req.body;
        const user = new User({ username, contact, college });
        user.college.address = address;
        if (req.file) user.profileImage.url = req.file.path;
        if (req.file) user.profileImage.filename = req.file.filename;

        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Yourdalaal");
            res.redirect("/yourdalaal");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("register");
    }
};
module.exports.loginUser = (req, res) => {
    req.flash("success", "Welcome to YourDalaal");
    const redirectUrl = req.session.returnTo || "/yourdalaal";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};
module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash("success", "Loged out!");
    res.redirect("/yourdalaal");
};
