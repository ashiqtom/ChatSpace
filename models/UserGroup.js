const mongoose = require('mongoose');

const userGroupSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    isAdmin: { type: Boolean, default: false }
});

const UserGroup = mongoose.model('UserGroup', userGroupSchema);
module.exports = UserGroup;
