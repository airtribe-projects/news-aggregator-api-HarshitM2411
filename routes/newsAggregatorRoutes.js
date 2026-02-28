const express = require('express');
const router = express.Router();
const { validateJWT } = require('../middleware/validateJWT');
const {
    registerUser,
    loginUser,
    getUserPreferences,
    updatePreferences
} = require('../controllers/newsAggregatorController');

// POST /users/signup - Register a new user
router.post('/signup', async (req, res) => {
    const user = req.body;
    if (!user.email) {
        res.status(400).send({ message: 'Email is required' });
        return;
    }
    const result = await registerUser(user);
    switch (result.message) {
        case 'User registered successfully':
            res.status(result.status).send({ message: result.message, user: result.user });
            return;
        default:
            res.status(result.status).send({ message: result.message, user: result.user });
    }
});

// POST /users/login - Authenticate user and return JWT
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const status = await loginUser({ email, password });

    switch (status.message) {
        case 'User not found':
            res.status(404).send({ message: status.message, token: status.token });
            return;
        case 'Wrong password':
            res.status(401).send({ message: status.message, token: status.token });
            return;
        default:
            res.status(200).send({ message: status.message, token: status.token });
    }
});

router.use(validateJWT);

// GET /users/preferences - Get user preferences
router.get('/preferences', async (req, res) => {
    const status = await getUserPreferences(req.user.email);
    switch (status.message) {
        case 'User not found':
            res.status(404).send({ message: status.message, preferences: status.preferences });
            return;
        case 'Preferences retrieved successfully':
            res.status(200).send({ message: status.message, preferences: status.preferences });
            return;
    }
});

// PUT /users/preferences - Update user preferences
router.put('/preferences', async (req, res) => {
    const payload = req.body.preferences;
    if (!payload) {
        res.status(400).send({ message: 'Preferences are required in the request body' });
        return;
    }
    const status = await updatePreferences(req.user.email, payload);
    switch (status.message) {
        case 'User not found':
            res.status(404).send({ message: status.message, preferences: status.preferences });
            return;
        case 'Preferences updated successfully':
            res.status(200).send({ message: status.message, preferences: status.preferences });
            return;
    }

});


module.exports = router;