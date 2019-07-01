const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coaches = new Schema(
    {
        FirstName: String,
        LastName: String,
        PhoneNumber: String,
        Email: String
    }
);

module.exports = coaches;