const mongoose = require('mongoose');
const Chat = require('../models/chat'); // Ensure these paths are correct
const ArchivedChat = require('../models/archivedChat');

exports.archiveOldChats = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        console.log('Running the cron job to archive old chats');

        // Define the date threshold (1 day old)
        const date = new Date();
        date.setDate(date.getDate() - 1);

        // Find all chats older than 1 day
        const oldChats = await Chat.find({
            createdAt: { $lt: date }
        }).session(session);

        // Move each old chat to ArchivedChat and delete from Chat
        for (let chat of oldChats) {
            await ArchivedChat.create([{
                name: chat.name,
                chat: chat.chat,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt,
                UserId: chat.UserId,
                groupId: chat.groupId
            }], { session });
            
            await Chat.deleteOne({ _id: chat._id }).session(session);
        }
        await session.commitTransaction();

    } catch (error) {
        await session.abortTransaction();
        console.error('Error archiving old chats:', error);
    } finally {
        session.endSession();
    }
};
