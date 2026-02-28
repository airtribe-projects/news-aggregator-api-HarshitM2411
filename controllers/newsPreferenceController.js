const users = require('../models/userModel');
const axios = require('axios');

const newsCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

// Function to get news based on user preferences with caching
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

const markNewsAsRead = async (newsId) => {
    /**
     * I couldn't find the API endpoint to mark news as read, so I am leaving this function as a placeholder.
     * I'm explaining the logic I would implement here:
     * The API calling implementation remains same as above. Will pass the APIkey in headers and pass the additional required params as mentioned. 
     * And then I will handle the response based on the API documentation. If the API returns a success message, I will return a success message from this function as well. Otherwise, I will return an error message.
     * I will implement the same logic for the other functions as well.
     * 
     * markNewsAsFavourite,
     * getReadNews,
     * getFavouriteNews,
     * searchNews
     */
}

const markNewsAsFavourite = async (newsId) => {
    /**
     * I couldn't find the API endpoint to mark news as favourite, so I am leaving this function as a placeholder.
     * Logic will be same as above
     */
};

const getReadNews = async () => {
    /**
     * I couldn't find the API endpoint to get read news, so I am leaving this function as a placeholder.
     * The API calling implementation remains same as above. Will pass the APIkey in headers and pass the additional required params as mentioned.
     */
};

const getFavouriteNews = async () => {
    /**
     * I couldn't find the API endpoint to get favourite news, so I am leaving this function as a placeholder.
     * The API calling implementation remains same as above. Will pass the APIkey in headers and pass the additional required params as mentioned.
    */
};

const searchNews = async (newsId) => {
    /**
         * I couldn't find the API endpoint to search news, so I am leaving this function as a placeholder.
         * I'm explaining the logic I would implement here:
         * The API calling implementation remains same as above. Will pass the APIkey in headers and pass the additional required params as mentioned. 
         * And then I will handle the response based on the API documentation. If the API returns a success message, I will return a success message from this function as well. Otherwise, I will return an error message.
         * I will implement the same logic for the other functions as well.
     */
};

module.exports = {
    getPrefferedNews,
    markNewsAsRead,
    markNewsAsFavourite,
    getReadNews,
    getFavouriteNews,
    searchNews
};