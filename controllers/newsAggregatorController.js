const users = require('../models/userModel');
const bcrypt = require('bcrypt');
const SALT_ROUND = 5;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Function to register a new user
const registerUser = async (user) => {
    try {
        // Validate before hashing, otherwise Mongoose validates the hash not the original password
        const tempUser = new users(user);
        await tempUser.validate();

        user.password = await bcrypt.hash(user.password, SALT_ROUND);
        const dbUser = await users.create(user);
        return { message: 'User registered successfully', user: dbUser, status: 200 };
    } catch (error) {
        const status = 400;
        const message = error.message;
        return { status, message, user: null };
    }
};

// Function to authenticate user and return JWT
const loginUser = async ({ email, password }) => {
    const dbUser = await users.findOne({ email });

    if (!dbUser) {
        return { message: 'User not found', token: null };
    }

    const isSamePassword = await bcrypt.compare(password, dbUser.password);

    if (!isSamePassword) {
        return { message: 'Wrong password', token: null };
    }

    const token = jwt.sign({ username: dbUser.name, email: dbUser.email }, JWT_SECRET, { expiresIn: '1h' });
    return { message: 'Login successful', token };
}

// Function to get user preferences
const getUserPreferences = async (email) => {
    const dbUser = await users.findOne({ email });
    if (!dbUser) {
        return { message: 'User not found', preferences: null };
    }
    return { message: 'Preferences retrieved successfully', preferences: dbUser.preferences };
}

// Function to update user preferences
const updatePreferences = async (email, preferences) => {
    const dbUser = await users.findOneAndUpdate(
        { email }, //filter
        { preferences }, //update
        { new: true, runValidators: true } //return updated document
    );
    if (!dbUser) {
        return { message: 'User not found', preferences: null };
    }
    return { message: 'Preferences updated successfully', preferences: dbUser.preferences };
}

module.exports = {
    registerUser,
    loginUser,
    getUserPreferences,
    updatePreferences
}