const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const players = new Schema(
    {
        FirstName: String,
        LastName: String,
        Birthdate: Date,
        Team: {
            type: Schema.Types.ObjectId,
            ref: 'teams',
            default: null
        },
        Guardian: {
            type: Schema.Types.ObjectId,
            ref: 'guardians',
            default: null
        }
    }
);

module.exports = players;