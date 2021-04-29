const { db } = require('../db/sql');
const { DataTypes } = require('sequelize');

const quiz_table = db.define('quiz_table', {
    quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    quiz_name: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    quiz_timer: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    quiz_timer_type: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    quiz_timer_time: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    quiz_have_sections: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    quiz_section_info: {
        type: DataTypes.TEXT('long'),
        defaultValue: null
    },
    quiz_questions: {
        type: DataTypes.TEXT('long'),
        defaultValue: null
    }
});

db.sync();
module.exports = quiz_table;