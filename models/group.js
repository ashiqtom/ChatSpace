const Sequelize=require('sequelize');
const sequelize = require('../util/database');

const Group = sequelize.define('group', {
    groupName:{
        type:Sequelize.STRING,
        allowNull:false
    }
});

module.exports = Group;