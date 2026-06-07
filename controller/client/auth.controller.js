const User = require("../../model/user.model");
const Otp = require("../../model/otp.model");

const passwordHelper = require("../../helper/password.helper");
const sendMailerHelper = require("../../helper/sendMailer.helper")
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

    const data = {
        userName: userName,
        email: req.body.email,
        phone: req.body.phone,
        password: password,
        status: "active",
        avatar: req.body.avatarUser,
    }

    const dataUser = new User(data);
    await dataUser.save();

    // tokenUser
    const tokenUser = jwt.sign(
        {
            id: dataUser._id,
            username: dataUser.userName
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "7d"
        }
    );

    // Gửi cookie
    res.cookie(
        "tokenUser",
        tokenUser,
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
    console.log(req.body.password)
    console.log(existEmail)
    const password = await passwordHelper.comparePassword(req.body.password, existEmail.password);

    if (!password) {
        console.log("sai mật khẩu")
        req.flash("error", "Mật khẩu không đúng!");
        return res.redirect(req.get("referer") || "/");
    }

    // tokenUser
    const tokenUser = jwt.sign(
        {
            id: existEmail._id,
            username: existEmail.userName
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: "7d"
        }
    );

    // Gửi cookie
    res.cookie(
        "tokenUser",
        tokenUser,
        {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    );

    res.redirect("/");
}

// [GET] /auth/logout
module.exports.logout = async (req, res) => {
    res.clearCookie("tokenUser");
    res.redirect("/auth");
}

// [GET] /auth/forgot-password
module.exports.forgotPassword = async (req, res) => {
    res.render("client/page/auth/forgot-password", {
        titlePage: "Quên mật khẩu"
    });
}

// [POST] /auth/forgot-password
module.exports.forgotPasswordPost = async (req, res) => {
    const existEmail = await User.findOne({
        deleted: false,
        status: "active",
        email: req.body.email
    });

    if (!existEmail) {
        req.flash("error", "Mật khẩu không đúng!");
        return res.redirect(req.get("referer") || "/");
    }
    const email = req.body.email;
    const otp = crypto.randomInt(100000, 1000000).toString();
    const objectForgotPass = {
        email: email,
        otp: otp,
        expireAt: new Date()
    };
    const record = new Otp(objectForgotPass);
    await record.save();
    //Gửi OTP qua email
    const toEmail = email;
    const subject = "Mã OTP xác nhận";
    const html = `
            Mã OTP để lấy lại mật khẩu là <b>${otp}</b>. Sẽ hết hạn sau 3 phút
        `;
    sendMailerHelper.sendMailer(toEmail, subject, html);
    res.redirect(`/auth/forgot-password/otp?email=${email}`);
}

// [GET] /auth/forgot-password/otp
module.exports.getOtp = async (req, res) => {
    const email = req.query.email;
    res.render("client/page/auth/get-otp", {
        titlePage: "Nhập mã OTP",
        email: email
    });
}

// [POST] /auth/forgot-password/otp
module.exports.getOtpPost = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;
    const checkOtp = await Otp.findOne({
        email: email,
        otp: otp
    });
    if(!checkOtp){
        req.flash("error", "Mật khẩu không đúng!");
        return res.redirect(req.get("referer") || "/");
    }
    res.redirect(`/auth/reset-password?email=${email}`);
}

// [GET] /auth/reset-password
module.exports.resetPassword = async (req, res) => {
    const email = req.query.email;
    res.render("client/page/auth/reset-password", {
        titlePage: "Đặt lại mật khẩu",
        email: email
    });
}

// [POST] /auth/reset-password
module.exports.resetPasswordPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const existEmail = await User.findOne({
        email: email,
        deleted: false,
        status: "active"
    });
    if(!existEmail){
        req.flash("error", "Email không đúng!");
        return res.redirect(req.get("referer") || "/");
    }
    const newPassword = await passwordHelper.hashPassword(password);

    await User.updateOne({
        email: email,
        status: "active",
        deleted: false
    }, {
        $set: {
            password: newPassword
        }
    });

    res.redirect("/auth");
}