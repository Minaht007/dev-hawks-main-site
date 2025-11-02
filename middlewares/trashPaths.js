// src/middlewares/trashPaths.js

const TRASH_PATHS = [
    '/wp-admin', '/wp-login.php', '/xmlrpc.php', '/phpmyadmin',
    '/admin', '/administrator', '/login', '/user/login',
    '/.env', '/config.php', '/wp-config.php',
    '/api', '/graphql', '/rest', '/v1', '/wp-includes', '/wp-content',
    '/wordpress/wp-admin/setup-config.php', '/wp-admin/setup-config.php'
]

module.exports = (req, res, next) => {
    const path = req.path.toLowerCase();

    if (
        TRASH_PATHS.some(p => path.startsWith(p)) ||
        path.endsWith('.php')
    ) {
        return res.status(404).end(); // Без HTML, быстро
    }

    next();
};