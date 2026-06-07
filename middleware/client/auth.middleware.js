const User = require("../../model/user.model");

module.exports.auth = async (req, res) => {
    const refreshToken =
        req.cookies.refreshToken;

    if (!refreshToken) {
        return res.sendStatus(401);
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_ACCESS_SECRET
        );

        const user =
            await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.sendStatus(403);
        }

        const newAccessToken = jwt.sign(
            {
                id: user._id,
                username: user.userName
            },
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn: "15m"
            }
        )

        res.cookie(
            "accessToken",
            newAccessToken,
            {
                httpOnly: true,
                maxAge: 15 * 60 * 1000
            }
        );

        res.json({
            success: true
        });

    } catch (error) {
        res.sendStatus(403);
    }
}