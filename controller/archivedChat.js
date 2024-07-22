const Chat = require('../models/chat');
const ArchivedChat = require('../models/archivedChat');
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

exports.archiveOldChats =async () => { 
    const transaction= await sequelize.transaction();
    try {
      console.log('Running the cron job to archive old chats');
  
      // Define the date threshold (1 day old)
      const date = new Date();
      date.setDate(date.getDate() - 1);
      // dateThreshold.getDate() retrieves the day of the month from the dateThreshold object.
      // dateThreshold.setDate(...) sets the day of the month for the dateThreshold object.
      // By calling dateThreshold.getDate() - 1, you subtract one day from the current day of the month.
      // setDate adjusts the dateThreshold to be exactly 1 day (24 hours) before the current date and time.
      
      // Find all chats older than 1 day
      const oldChats = await Chat.findAll({
        where: {
          createdAt: {
            [Sequelize.Op.lt]: date
          }
        },
        transaction
      });
  
      // Move each old chat to ArchivedChat and delete from Chat
      for (let chat of oldChats) {
        await ArchivedChat.create({
          name: chat.name,
          chat: chat.chat,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          UserId:chat.UserId,
          groupId:chat.groupId
          },
          {transaction}
        );
        await chat.destroy({transaction});
      }
      await transaction.commit();//If all operations succeed, this commits the changes.

      console.log('Archived old chats successfully');
    } catch (error) {
      await transaction.rollback();//If any operation fails, this rolls back all changes made during the transaction.
      console.error('error archiving old chats:', error); 
    }
  };

// Benefits of Using Transactions
// Consistency: Ensures that all related operations are completed successfully before committing.
// Atomicity: Treats a series of operations as a single unit, rolling back all changes if any operation fails.
// Data Integrity: Prevents partial updates that could corrupt the database state.

