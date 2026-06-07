const User = require("../../model/user.model");

const passwordHelper = require("../../helper/password.helper");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// [GET] /auth
module.exports.auth = async (req, res) => {
    res.render("client/page/auth/auth", {
        titlePage: "Register"
    });
}

// [POST] /auth/register
module.exports.register = async (req, res) => {
    const existEmail = await User.findOne({
        deleted: false,
        status: "active",
        email: req.body.email
    });
    if (existEmail) {
        req.flash("error", "Email đã tồn tại!");
        return res.redirect(req.get("referer") || "/");
    }

    const password = await passwordHelper.hashPassword(req.body.password);
    const userName = `${req.body.surname} ${req.body.name}`;
    const tokenUser = crypto.randomBytes(32).toString("hex");

    const data = {
        userName: userName,
        email: req.body.email,
        phone: req.body.phone,
        password: password,
        tokenUser: tokenUser,
        status: "active",
        avatar: req.body.avatarUser,
    }

    const dataUser = new User(data);
    await dataUser.save();

    // Access token
    const accessToken = jwt.sign(
        {
            id: dataUser._id,
            username: dataUser.userName
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m"
        }
    );

    // Refresh token
    const refreshToken = jwt.sign(
        {
            id: dataUser._id,
            username: dataUser.username
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "7d"
        }
    );

    // Update refreshToken
    await User.updateOne(
        { _id: dataUser._id },
        {
            refreshToken: refreshToken
        }
    );

    // Gửi cookie
    res.cookie(
        "accessToken",
        accessToken,
        {
            httpOnly: true,
            maxAge: 15 * 60 * 1000
        }
    );

    res.cookie(
        "refreshToken",
        refreshToken,
        {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    );
    res.redirect("/");
}

// [POST] /auth/login
module.exports.login = async (req, res) => {
    const existEmail = await User.findOne({
        deleted: false,
        status: "active",
        email: req.body.email
    });
    if (!existEmail) {
        req.flash("error", "Email không tồn tại hoặc đã bị khóa!");
        return res.redirect(req.get("referer") || "/");
    }

    const password = await passwordHelper.comparePassword(req.body.password, existEmail.password);

    if (!password) {
        console.log("sai mật khẩu")
        req.flash("error", "Mật khẩu không đúng!");
        return res.redirect(req.get("referer") || "/");
    }

    // Access token
    const accessToken = jwt.sign(
        {
            id: existEmail._id,
            username: existEmail.userName
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m"
        }
    );

    // Refresh token
    const refreshToken = jwt.sign(
        {
            id: existEmail._id,
            username: existEmail.username
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "7d"
        }
    );

    // Update refreshToken
    await User.updateOne(
        { _id: existEmail._id },
        {
            refreshToken: refreshToken
        }
    );

    // Gửi cookie
    res.cookie(
        "accessToken",
        accessToken,
        {
            httpOnly: true,
            maxAge: 15 * 60 * 1000
        }
    );

    res.cookie(
        "refreshToken",
        refreshToken,
        {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    );
    res.redirect("/");
}

// [GET] /auth/logout
module.exports.logout = async (req, res) => {
    await User.updateOne(
        { _id: req.user.id },
        {
            refreshToken: ""
        }
    );

    res.clearCookie("accessToken");

    res.clearCookie("refreshToken");

    res.redirect("/auth");
}