const users = require('../models/userModel');
const axios = require('axios');

const newsCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

const getPrefferedNews = async (email) => {
    const body = { email };
    const dbUser = await users.findOne(body);
    if (!dbUser) {
        return { message: 'User not found', news: [] };
    }

    const cacheKey = dbUser.preferences.join(' AND ');
    if (newsCache.has(cacheKey)) {
        const { data, cachedAt } = newsCache.get(cacheKey);
        if (Date.now() - cachedAt < CACHE_TTL_MS) {
            return { message: 'News retrieved successfully', news: data };
        }
        newsCache.delete(cacheKey);
    }

    try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
            headers: {
                'X-Api-Key': process.env.NEWS_API_KEY
            },
            params: {
                q: cacheKey,
            }
        });
        newsCache.set(cacheKey, { data: response.data, cachedAt: Date.now() });
        return { message: 'News retrieved successfully', news: response.data };

    } catch (error) {
        return { message: 'Error fetching news', news: [] };
    }
}

module.exports = {
    getPrefferedNews
};