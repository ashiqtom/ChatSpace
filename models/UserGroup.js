const Sequelize=require('sequelize');
const sequelize = require('../util/database');
const Group = require('./group');

const UserGroup = sequelize.define('UserGroup', {
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});
module.exports = UserGroup;