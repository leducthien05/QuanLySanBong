const nodemailer = require("nodemailer");

module.exports.sendMailer = (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        },
    });
    const message = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        html: html
    };
    return transporter.sendMail(message, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            // do something useful
        }
    });
}