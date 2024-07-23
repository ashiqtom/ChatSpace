const User = require('../models/user');
const Group = require('../models/group');
const UserGroup = require('../models/UserGroup');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const stringValidate = (string) => {
    return string !== undefined && string.length > 0;
};

exports.signupUser = async (req, res) => {
    try {
        const { username, email, phoneNumber, password } = req.body;
        
        if (!stringValidate(username) || !stringValidate(email) || !stringValidate(password) || !stringValidate(phoneNumber)) {
            return res.status(400).json({ error: "Bad request, something is missing" });        
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const saltrounds = Number(process.env.SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, saltrounds); // Blowfish 

        await User.create({ username, email, phoneNumber, password: hashedPassword });
        res.status(201).json({ message: 'Successfully created new user' });

    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.params; // Changed from req.params to req.body
        const existingUser = await User.findOne({ email });
        
        if (!existingUser) {
            return res.status(404).json({ error: 'Invalid email' });
        }

        const passwordCompared = await bcrypt.compare(password, existingUser.password);

        if (passwordCompared) {
            return res.status(200).json({
                success: true,
                message: "User logged in successfully",
                userName: existingUser.username,
                token: generateAccessToken(existingUser._id, existingUser.username)
            });
        } else {
            return res.status(400).json({ success: false, error: 'Password is incorrect' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ error: 'Internal server error', success: false });
    }
};

const generateAccessToken = (id, name) => {
    return jwt.sign({ userId: id, name: name }, process.env.jwtSecretkey);
};

exports.getloggedUser = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user._id;

        // Check if the group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Find UserGroup records for the specified group
        const userGroups = await UserGroup.find({ group: groupId });

        // Extract user IDs from the userGroups
        const userIds = userGroups.map(ug => ug.user);
        
        // Check if the requesting user is part of the group
        const isMember = userIds.some(id => id.equals(userId));
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }
        // Find all logged-in users in the group, excluding the requesting user
        const usersInGroup = await User.find({
            _id: { $in: userIds, $ne: userId }, // Exclude the requesting user
            loggedIn: true
        }).select('username');

        const usernames = usersInGroup.map(user => user.username);
        
        return res.status(200).json(usernames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.setloggedUser = async (user) => {
    try {
        user.loggedIn = true;
        await user.save();
    } catch (error) {
        console.log(error);
    }
};

exports.setlogOff = async (user) => {
    try {
        user.loggedIn = false;
        await user.save();
    } catch (error) {
        console.log(error);
    }
};
