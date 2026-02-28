const express = require('express');
const router = express.Router();
const { validateJWT } = require('../middleware/validateJWT');
const {
    registerUser,
    loginUser,
    getUserPreferences,
    updatePreferences
} = require('../controllers/newsAggregatorController');


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

router.get('/preferences', async (req, res) => {
    const status = await getUserPreferences(req.user.email);
    res.status(200).send({ message: status.message, preferences: status.preferences });
});

router.put('/preferences', async (req, res) => {
    const payload = req.body.preferences;
    if (!payload) {
        res.status(400).send({ message: 'Preferences are required in the request body' });
        return;
    }
    const status = await updatePreferences(req.user.email, payload);
    res.status(200).send({ message: status.message, preferences: status.preferences });
});


module.exports = router;