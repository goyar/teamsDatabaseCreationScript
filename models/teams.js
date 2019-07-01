const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teams = new Schema(
    {
        TeamName: String,
        Players: {
            type: Number,
            default: 0
        },
        Category: {
            type: Schema.Types.ObjectId,
            ref: 'categories'
        },
        Coach: {
            type: Schema.Types.ObjectId,
            ref: 'coaches'
        }
    }
);

module.exports = teams;