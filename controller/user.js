const User = require('../models/user');
const Group = require("../models/group");
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');

const stringValidate=(string)=>{
    if(string===undefined || string.length===0){
        return false;
    }else{
        return true;
    }
}

exports.signupUser=async (req, res) => {
    try {
        const { username, email, phoneNumber, password } = req.body;
        
        if(!stringValidate(username)|| !stringValidate(email)||!stringValidate(password) || !stringValidate(phoneNumber)){
            return res.status(400).json({error:"bad request ,something is missing"});        
        }
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const saltrounds=Number(process.env.saltrounds);
        const hashedPassword = await bcrypt.hash(password,saltrounds); //blowfish 

        await User.create({ username, email , phoneNumber , password:hashedPassword});
        res.status(201).json({message: 'Successfuly create new user'});

    } catch (error) {
        console.error('error signing up:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}



exports.loginUser = async (req, res) => {
    try {
        const { email, password} = req.params; 
        const existingUser = await User.findOne({ where: { email } });
        
        if (!existingUser) {
            return res.status(404).json({ error: 'Invalid email' });
        }
        const passwordCompared=await bcrypt.compare(password,existingUser.password);

        if(passwordCompared){
            return res.status(200).json({ success: true, message: "User logged in successfully",userName:existingUser.username,token: generateAccessToken(existingUser.id,existingUser.username)});
        }else{
            return res.status(400).json({success: false, error: 'Password is incorrect'});
        }
    } catch (error) {
        console.error('error login:', error);
        return res.status(500).json({error: 'Internal server error', success: false});
    }
};

const generateAccessToken=(id,name)=>{
    return jwt.sign({userId:id,name:name},process.env.jwtSecretkey)
};


exports.getloggedUser = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await Group.findOne({ where: { id:groupId } });
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const isMember = await group.hasUser(userId);
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        const usersInGroup = await group.getUsers({
            where: { loggedIn: true },
            attributes: ['username']
        });

        const usernames = usersInGroup.map(user => user.username);

        return res.status(200).json(usernames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error:'Internal server error'});
    }
};

exports.setloggedUser = async (user) => {
    try {
        user.loggedIn = true;
        await user.save();
    } catch (error) {
        console.log(error);
    }
}

exports.setlogOff = async (user) => {
    try {
        user.loggedIn = false;
        await user.save();
    } catch (error) {
        console.log(error);
    }
}

