const { db } = require('../db/sql');
const { DataTypes } = require('sequelize');

const question_table = db.define('question_table', {
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    question_tag_1: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    question_tag_2: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    question_body_img_url: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    question_type: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    question_answer: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    question_explanation: {
        type: DataTypes.TEXT('long'),
        defaultValue: null
    }
});

db.sync();
module.exports = question_table;