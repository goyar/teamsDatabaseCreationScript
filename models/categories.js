const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categories = new Schema(
    {
        CategoryName: String,
        MaxAge: Number,
        MinAge: Number,
        MaxPlayers: Number,
        MonthlyFee: Number
    }
);

module.exports = categories;