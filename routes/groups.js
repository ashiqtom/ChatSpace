const express = require('express');

const router = express.Router();

const groupController = require('../controller/group');
const authenticatemiddleware = require('../middleware/auth');

router.get('/userList/:groupId',groupController.getUsers)
router.post('/createGroup',authenticatemiddleware.authenticate, groupController.createGroup);
router.get('/getGroup',authenticatemiddleware.authenticate,groupController.getGroup);
router.post('/addMembers',authenticatemiddleware.authenticate,groupController.addMember);
router.get('/groupMembers/:groupName',authenticatemiddleware.authenticate,groupController.getGroupMembers);
router.post('/promoteToAdmin',authenticatemiddleware.authenticate,groupController.promoteToAdmin);
router.post('/removeUser',authenticatemiddleware.authenticate,groupController.removeUser);
router.delete('/deleteGroup',authenticatemiddleware.authenticate,groupController.deleteGroup)

module.exports = router;