const express = require('express');
const newsPreferenceRouter = express.Router();
const { validateJWT } = require('../middleware/validateJWT');
const { getPrefferedNews } = require('../controllers/newsPreferenceConroller');

newsPreferenceRouter.use(validateJWT);
newsPreferenceRouter.get('/', async (req, res) => {
    const response = await getPrefferedNews(req.user.email);
    switch (response.message) {
        case 'User not found':
            res.status(404).send({ message: response.message, news: response.news });
            return;
        case 'News retrieved successfully':
            res.status(200).send({ message: response.message, news: response.news });
            return;
        default:
            res.status(500).send({ message: response.message, news: response.news });
    }
});

module.exports = newsPreferenceRouter;