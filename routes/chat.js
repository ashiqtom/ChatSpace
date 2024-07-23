const express = require('express');
const multer = require('multer');
const upload = multer();
const router = express.Router();

const chatController = require('../controller/chat');
const authenticatemiddleware = require('../middleware/auth');

// router.post('/uploadFile',authenticatemiddleware.authenticate, upload.single('myFile') ,chatController.uploadFile);
router.post('/postChat',authenticatemiddleware.authenticate, chatController.postChat);
router.get('/getChat/:lastMsgId/:groupId',authenticatemiddleware.authenticate,chatController.getChat);


module.exports = router;