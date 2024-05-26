const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const jwtOptions = {
    algorithms: ['HS256'],
};

const authentication = (req, res, next) => {
    if (req.path === '/api/auth/sign_in' || req.path === '/api/auth/sign_up'  || req.path === '/api/auth/update_role' || req.path === '/api/auth/get_role' || req.path === '/api/auth/forgotpass' ) {
        return next();
    }

    if (req.method === 'GET') {
        return next();
    }

    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
        const token = authorizationHeader.slice(7);
        jwt.verify(token, jwtSecret, jwtOptions, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            req.user = decoded;
            next();

        });
    }
};

module.exports = { jwtSecret, authentication };

