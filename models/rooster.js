const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rooster = new Schema(
    {
        Team: {
            type: Schema.Types.ObjectId,
            ref: 'teams'
        },
        Player: {
            type: Schema.Types.ObjectId,
            ref: 'players'
        },
        Active: Boolean
    }
);

module.exports = rooster;