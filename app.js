const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const path = require('path');
const mongoose=require('mongoose');
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

const adminRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/groups');

app.use('/user', adminRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);


app.use(express.static(path.join(__dirname, 'public')));



const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const port = process.env.PORT || 3000;

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Connection error', err);
  }
};

startServer();