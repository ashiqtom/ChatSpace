const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    password: { type: String, required: true },
    loggedIn: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
