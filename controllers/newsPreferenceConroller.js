const users = require('../models/userModel');
const axios = require('axios');

const getPrefferedNews = async (email) => {
    const body = { email };
    const dbUser = await users.findOne(body);
    if (!dbUser) {
        return { message: 'User not found', news: [] };
    }

    try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
            headers: {
                'X-Api-Key': process.env.NEWS_API_KEY
            },
            params: {
                q: dbUser.preferences.join(),
            }
        });
        return { message: 'News retrieved successfully', news: response.data };

    } catch (error) {
        return { message: 'Error fetching news', news: [] };
    }
}

module.exports = {
    getPrefferedNews
};