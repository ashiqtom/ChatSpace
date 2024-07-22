const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.authenticate=async(req,res,next)=>{
    try{
        const token=req.header('authorization');
        const user=jwt.verify(token,process.env.jwtSecretkey);
        
        const userDetails=await User.findByPk(user.userId)
        req.user=userDetails;
        
        next();
    } catch(error){
        console.log(error); 
        return res.status(401).json({success:false});
    }
}

exports.authenticateSocket = async (socket, next) => {
    try {
      const { token } = socket.handshake.query;
      if (!token) {
        return next(new Error('Authentication error'));
      }
  
      const decoded = jwt.verify(token, process.env.jwtSecretkey);
      const user = await User.findByPk(decoded.userId);
  
      if (!user) {
        return next(new Error('Authentication error'));
      }
  
      socket.user = user;
      next();
    } catch (error) {
      console.error(error);
      next(new Error('Authentication error'));
    }
  };