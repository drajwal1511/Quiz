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
        allowNull: false,
    },
    quiz_timer: {
        type: DataTypes.STRING,
        allowNull: false,
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
        allowNull: false,
    },
    quiz_section_info: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    },
    quiz_questions: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
    }
});

db.sync();
module.exports = quiz_table;