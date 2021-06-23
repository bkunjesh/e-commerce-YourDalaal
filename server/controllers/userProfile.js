const User = require("../models/user");

module.exports.renderUserProfile = async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username: username }).populate(
        "products"
    );

    res.render("profile/userProfile", { user });
};
