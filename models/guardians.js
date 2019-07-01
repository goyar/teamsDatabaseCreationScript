const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guardians = new Schema(
    {
        FirstName: String,
        LastName: String,
        AddressStreet: String,
        AddressState: String,
        AddressCity: String,
        AddressZip: String,
        PhoneNumber: String,
        Email: String
    }
);

module.exports = guardians;