module.exports.checkPermission = (permission) => {
    return async (req, res, next) => {
        if (!res.locals.accountRole) {
            return res.redirect("/admin/auth/login");
        }

        const permissions = res.locals.accountRole.permission || [];

        if (!permissions.includes(permission)) {
            return res.status(403).render("admin/pages/errors/403", {
                pageTitle: "403 - Forbidden"
            });
        }

        next();
    };
};