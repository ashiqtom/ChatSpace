const mongoose = require('mongoose');

const archivedChatSchema = new mongoose.Schema({
    name: String,
    chat: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    UserId: mongoose.Schema.Types.ObjectId,
    groupId: mongoose.Schema.Types.ObjectId
});
const ArchivedChat = mongoose.model('ArchivedChat', archivedChatSchema);
module.exports = ArchivedChat;
