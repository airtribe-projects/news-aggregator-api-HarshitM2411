const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const logger = require('./middleware/newsAggregatorMiddleWare');
const router = require('./routes/newsAggregatorRoutes');
const newsPreferenceRouter = require('./routes/newsPreferenceRoutes');

const app = express();
const PORT = process.env.PORT;
const URI = process.env.MONGODB_URI;

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/users', router);
app.use('/news', newsPreferenceRouter);

app.get('/', (req, res) => {
    res.send("Welcome to the News Aggregator API");
});

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(URI).then(() => {
        console.log("Connected to MongodDB via Mongoose");
        app.listen(PORT, () => {
            console.log("Express application started on port", PORT);
        });
    });
}


module.exports = app;