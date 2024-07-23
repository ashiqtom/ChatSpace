const UserGroup = require('../models/UserGroup');
const Group = require('../models/group');
const User= require('../models/user');
const mongoose = require('mongoose');
// Create Group
exports.createGroup = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { groupName } = req.body;

        const group = new Group({ groupName });
        await group.save({ session });

        const user = await User.findById(req.user.id).session(session);
        const userGroup = new UserGroup({ user: user._id, group: group._id, isAdmin: true });
        await userGroup.save({ session });

        await session.commitTransaction();
        res.status(200).json({ message: 'Group created successfully' });
    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).json({ message: 'An error occurred' });
    } finally {
        session.endSession();
    }
};

// Delete Group
exports.deleteGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const groupId = req.body.groupId;

        const userGroup = await UserGroup.findOne({
            user: userId,
            group: groupId,
            isAdmin: true
        });

        if (!userGroup) {
            return res.status(403).json({ message: 'You are not admin' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        await group.deleteOne();
        res.status(200).json({ message: 'Group deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete group' });
    }
};

// Get Users
exports.getUsers = async (req, res) => {
    try {
        const { groupId } = req.params;
        
        // Get user IDs of users who are in the group
        const userGroups = await UserGroup.find({ group: groupId }).select('user');
        const userIdsInGroup = userGroups.map(ug => ug.user);
        // Get users who are not in the group
        const usersNotInGroup = await User.find({ _id: { $nin: userIdsInGroup } }).select('username'); 
        if(usersNotInGroup.length==0){
            res.status(200).json('no members');
        } else {
            res.status(200).json(usersNotInGroup);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get users' });
    }
};

// Remove User
exports.removeUser = async (req, res) => {
    try {
        const { groupName, username } = req.body;

        const group = await Group.findOne({ groupName });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const reqUserGroup = await UserGroup.findOne({ user: req.user.id, group: group._id });
        if (!reqUserGroup || !reqUserGroup.isAdmin) {
            return res.status(403).json({ message: 'You are not an admin of this group' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userGroup = await UserGroup.findOne({ user: user._id, group: group._id });
        if (userGroup) {
            await userGroup.deleteOne();
            res.status(200).json({ message: 'User removed from group successfully' });
        } else {
            res.status(404).json({ message: 'User is not a member of the group' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while removing user from group' });
    }
};

// Promote to Admin
exports.promoteToAdmin = async (req, res) => {
    try {
        const { groupName, username } = req.body;

        const group = await Group.findOne({ groupName });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const reqUserGroup = await UserGroup.findOne({ user: req.user.id, group: group._id });
        if (!reqUserGroup || !reqUserGroup.isAdmin) {
            return res.status(403).json({ message: 'You are not an admin of this group' });
        }
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userGroup = await UserGroup.findOne({ user: user._id, group: group._id });
        if (userGroup) {
            userGroup.isAdmin = true;
            await userGroup.save();
            res.status(200).json({ message: 'User promoted to admin successfully' });
        } else {
            res.status(404).json({ message: 'User is not a member of the group' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while promoting user to admin' });
    }
};

// Remove Member
exports.removeMember = async (req, res) => {
    try {
        const { groupName, username } = req.body;

        const group = await Group.findOne({ groupName });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const reqUserGroup = await UserGroup.findOne({ user: req.user.id, group: group._id });
        if (!reqUserGroup || !reqUserGroup.isAdmin) {
            return res.status(403).json({ message: 'You are not an admin of this group' });
        }

        const userGroup = await UserGroup.findOne({ user: user._id, group: group._id });
        if (userGroup) {
            await userGroup.deleteOne();
            res.status(200).json({ message: 'User removed from group successfully' });
        } else {
            res.status(404).json({ message: 'User is not a member of the group' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while removing the user from the group' });
    }
};

// Add Member
exports.addMember = async (req, res) => {
    try {
        const { groupName, username } = req.body;

        const group = await Group.findOne({ groupName });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userGroup = new UserGroup({ user: user._id, group: group._id });
        await userGroup.save();

        res.status(200).json({ message: 'User added to group successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while adding the user to the group' });
    }
};

// Get Group
exports.getGroup = async (req, res) => {
    try {
        const userId = req.user.id;

        const userGroups = await UserGroup.find({ user: userId }).populate('group', 'groupName id');
        const groups = userGroups.map(ug => ug.group).filter(group => group !== null);

        res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching groups' });
    }
};

// Get Group Members
exports.getGroupMembers = async (req, res) => {
    try {
        const { groupName } = req.params;
        const userId = req.user.id;

        const group = await Group.findOne({ groupName });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const isMember = await UserGroup.findOne({ user: userId, group: group._id });
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        const members = await UserGroup.find({ group: group._id }).populate('user', 'username');
        const usernames = members.map(member => ({
            username: member.user.username,
            isAdmin: member.isAdmin
        }));

        res.status(200).json(usernames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching group members' });
    }
};
