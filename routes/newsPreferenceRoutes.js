const express = require('express');
const newsPreferenceRouter = express.Router();
const { validateJWT } = require('../middleware/validateJWT');
const {
    getPrefferedNews,
    markNewsAsRead,
    markNewsAsFavourite,
    getReadNews,
    getFavouriteNews,
    searchNews
} = require('../controllers/newsPreferenceController');

newsPreferenceRouter.use(validateJWT);

// GET /news - Get news based on user preferences
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

// Additional routes for marking news as read
newsPreferenceRouter.post('/:id/read', async (req, res) => {
    const newsId = req.params.id;
    if (!newsId) {
        res.status(400).send({ message: 'News ID is required' });
        return;
    }
    const response = await markNewsAsRead(newsId);
    switch (response.message) {
        case 'News marked as read':
            res.status(200).send({ message: response.message });
            return;
        default:
            res.status(500).send({ message: response.message });
    }
});

// Additional routes for marking news as favourite
newsPreferenceRouter.post('/:id/favourite', async (req, res) => {
    const newsId = req.params.id;
    if (!newsId) {
        res.status(400).send({ message: 'News ID is required' });
        return;
    }
    const response = await markNewsAsFavourite(newsId);
    switch (response.message) {
        case 'News marked as favourite':
            res.status(200).send({ message: response.message });
            return;
        default:
            res.status(500).send({ message: response.message });
    }
});

// Additional routes for retrieving read news
newsPreferenceRouter.get('/read', async (req, res) => {
    const response = await getReadNews();
    switch (response.message) {
        case 'Read news retrieved successfully':
            res.status(200).send({ message: response.message, news: response.news });
            return;
        default:
            res.status(500).send({ message: response.message });
    }
});

// Additional routes for retrieving favourite news
newsPreferenceRouter.get('/favourite', async (req, res) => {
    const response = await getFavouriteNews();
    switch (response.message) {
        case 'Favourite news retrieved successfully':
            res.status(200).send({ message: response.message, news: response.news });
            return;
        default:
            res.status(500).send({ message: response.message });
    }
});

// Additional route for searching news by keyword
newsPreferenceRouter.post('/search/:keyword', async (req, res) => {
    const keyword = req.params.keyword;
    if (!keyword) {
        res.status(400).send({ message: 'Keyword is required' });
        return;
    }
    const response = await searchNews(keyword);
    switch (response.message) {
        case 'News searched successfully':
            res.status(200).send({ message: response.message, news: response.news });
            return;
        default:
            res.status(500).send({ message: response.message });
    }
});

module.exports = newsPreferenceRouter;