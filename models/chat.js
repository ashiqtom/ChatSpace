const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    chat: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
