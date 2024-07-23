const Chat = require('../models/chat');
const AWS = require('aws-sdk');// Make sure to import your socket configuration correctly

// Receiving io from the app.js
let io;
exports.init = (socketIoInstance) => {
    io = socketIoInstance;
};

// const uploadToS3 = async (data, filename) => {
//     try {
//         const BUCKET_NAME = process.env.s3bucketName;
//         const IAM_USER_KEY = process.env.s3Accesskey;
//         const IAM_USER_SECRET = process.env.s3Secretaccesskey;

//         const s3bucket = new AWS.S3({
//             accessKeyId: IAM_USER_KEY,
//             secretAccessKey: IAM_USER_SECRET
//         });
        
//         const params = {
//             Bucket: BUCKET_NAME,
//             Key: filename,
//             Body: data,
//             ACL: 'public-read'
//         };
        
//         const response = await s3bucket.upload(params).promise();
//         return response;
//     } catch (error) {
//         console.log('Upload error', error);
//         throw error;
//     }
// };

// exports.uploadFile = async (req, res) => {
//     try {
//         const { groupId } = req.body;
//         const file = req.file;
//         const uploadedFile = await uploadToS3(file.buffer, file.originalname);

//         const chatRes = new Chat({
//             name: req.user.username,
//             chat: uploadedFile.Location,
//             userId: req.user.id,
//             groupId: groupId
//         });
//         await chatRes.save();

//         io.to(groupId).emit('newMessage', groupId);
//         res.status(201).json({ url: uploadedFile.Location, message: "file posted" });

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Failed to post message' });
//     }
// };

exports.postChat = async (req, res) => {
    try {
        const { message, groupId } = req.body;
        const chatRes = new Chat({
            name: req.user.username,
            chat: message,
            userId: req.user.id,
            groupId: groupId
        });
        await chatRes.save();
        
        // Emit the new message to all clients in the group
        io.to(groupId).emit('newMessage', groupId);

        res.status(201).json({ message: "message posted" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to post message' });
    }
};

exports.getChat = async (req, res) => {
    try {
        const lastMessageId = req.params.lastMsgId || 0;
        const groupId = req.params.groupId;

        const chatRes = await Chat.find({
            groupId: groupId
        }, 'id name chat groupId');

        res.status(201).json(chatRes);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
};
