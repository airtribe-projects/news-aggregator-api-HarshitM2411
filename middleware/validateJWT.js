const jwtwebtoken = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const validateJWT = (req, res, next) => {
    const authHeader = req.headers || {};
    let token = authHeader.authorization;

    if (!token) {
        res.status(401).send({ message: 'No token provided' });
        return;
    }

    // Remove 'Bearer ' prefix if present
    if (token.startsWith('Bearer ')) {
        token = token.slice(7);
    }

    try {
        const decoded = jwtwebtoken.verify(token, JWT_SECRET);
        req.user = decoded;  // Attach decoded user info to request
        next();
    } catch (error) {
        res.status(401).send({ message: 'Invalid token' });
        return;
    }
}

module.exports = { validateJWT };