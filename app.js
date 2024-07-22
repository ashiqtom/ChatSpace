const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const path = require('path');
require('dotenv').config();
const app = express();


//socket.io
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

const {init} = require('./controller/chat');
init(io);// Pass io to the chat controller

const { authenticateSocket } = require('./middleware/auth');
io.use(authenticateSocket); //authenticate 

const {setloggedUser,setlogOff} = require('./controller/user');

io.on('connection', (socket) => {
  setloggedUser(socket.user)

  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
  });

  socket.on('disconnect', () => {
    if (socket.user) {
      setlogOff(socket.user)
    }
  });
});



// Start the cron job
const { CronJob } = require('cron');
const archiveController = require('./controller/archivedChat');

const job = new CronJob(
  '0 0 * * *', // Run at midnight every day
  archiveController.archiveOldChats, // Function to call
  null, // onComplete
  true, // Start the job right now
  'Asia/Kolkata' // Time zone of this job
);
job.start();




app.use(bodyParser.json());
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST'] 
}));


// Import sequelize and models
const sequelize = require('./util/database');
const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require('./models/group');
const UserGroup = require('./models/UserGroup');
const ArchivedChat = require('./models/archivedChat');

// Define model relationships
User.hasMany(Chat,{ onDelete: 'CASCADE' }); 
Chat.belongsTo(User);
User.hasMany(ArchivedChat, { onDelete: 'CASCADE' });
ArchivedChat.belongsTo(User);

Group.hasMany(Chat,{ onDelete: 'CASCADE' });
Chat.belongsTo(Group);
Group.hasMany(ArchivedChat, { onDelete: 'CASCADE' });
ArchivedChat.belongsTo(Group);

User.belongsToMany(Group, { through: UserGroup, onDelete: 'CASCADE' });
Group.belongsToMany(User, { through: UserGroup, onDelete: 'CASCADE' });


const adminRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/groups');

app.use('/user', adminRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});


sequelize
  .sync({force:true})
  .then(() => {
    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
