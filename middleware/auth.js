const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('authorization');
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.jwtSecretkey);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.log(error); 
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
}

exports.authenticateSocket = async (socket, next) => {
    try {
        const { token } = socket.handshake.query;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.jwtSecretkey);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return next(new Error('Authentication error: Invalid user'));
        }

        socket.user = user;
        next();
    } catch (error) {
        console.error(error);
        next(new Error('Authentication error'));
    }
};
