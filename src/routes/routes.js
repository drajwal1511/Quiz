const express = require('express');
const app = express();
const quiz_table = require('../models/quiz_table');
const question_table = require('../models/question_table');
const sequelize = require('sequelize');
require('../db/sql');
const multer = require('multer');
const fs = require("fs");
const ENV = require("../../env");
const fetch = require("node-fetch");
const csv = require("csv-parser");
var cors = require('cors');
const cmd = require("node-cmd");
app.use(express.json())
app.use(cors());

// {
//     "quiz_name":"Chem",
//     "quiz_timer":"Yes",
//     "quiz_timer_type":"whole",
//     "quiz_timer_time":"demo",
//     "quiz_have_sections":"No",
//     "quiz_sections_info":"[[null,15,15,15,1,0]]",
//     "quiz_questions":"[[1,null]]"
// }


// {
//     "quiz_name":"Chem",
//     "quiz_timer":"Yes",
//     "quiz_timer_type":"whole",
//     "quiz_timer_time":"demo",
//     "quiz_have_sections":"Yes",
//     "quiz_sections_info":"[[1,15,15,15,1,0],[2,15,15,30,2,0]]",
//     "quiz_questions":"[[1,1],[2,2],[3,2],[4,1]]"
// }

app.post('/create', async (req, res) => {
    //Basic concepts of this route:
    //Does the quiz have sections
    //No=>section_name="", and set quiz_questions section_name="", pos_marks=pos_marks, neg_marks=neq_marks
    //Yes=>For each section set quiz_questions
    var quizTimer = "Yes";
    var quizTimerType = null;
    var quizTimerTime = null;
    if (!req.body.quiz_timer) {
        quizTimer = "No";
    } else {
        if (req.body.quiz_timer_type == "Whole Quiz") {
            // whole quiz
            quizTimerType = "whole";
        } else {
            // per question
            quizTimerType = "per";
        }
        quizTimerTime = req.body.quiz_timer_time;
    }
    var quizHaveSections = "Yes";
    if (!req.body.quiz_have_sections) {
        quizHaveSections = "No";
    }
    var quizSectionsInfo = "[";
    for (var i = 0; i < req.body.quiz_sections_info.length; i++) {
        if (req.body.quiz_sections_info[i].name == "") {
            quizSectionsInfo += '[';
            quizSectionsInfo += "null";
            quizSectionsInfo += ',';
        } else {
            quizSectionsInfo += '[\"';
            quizSectionsInfo += req.body.quiz_sections_info[i].name;
            quizSectionsInfo += "\",";
        }
        quizSectionsInfo += req.body.quiz_sections_info[i].questionSelect;
        quizSectionsInfo += ",";
        quizSectionsInfo += req.body.quiz_sections_info[i].questionShow;
        quizSectionsInfo += ",";
        quizSectionsInfo += req.body.quiz_sections_info[i].maximumMarks;
        quizSectionsInfo += ",";
        if (req.body.quiz_sections_info[i].posMarks != undefined) {
            quizSectionsInfo += req.body.quiz_sections_info[i].posMarks;
        } else {
            quizSectionsInfo += 'null';
        }
        quizSectionsInfo += ",";
        if (req.body.quiz_sections_info[i].negMarks != undefined) {
            quizSectionsInfo += req.body.quiz_sections_info[i].negMarks;
        } else {
            quizSectionsInfo += 'null';
        }
        quizSectionsInfo += "]";
        if (i != (req.body.quiz_sections_info.length - 1)) {
            quizSectionsInfo += ",";
        }
    }
    quizSectionsInfo += "]";
    var quizQuestions = "[";
    for (var i = 0; i < req.body.quiz_questions.length; i++) {
        quizQuestions += "[";
        quizQuestions += req.body.quiz_questions[i].question_id;

        if (req.body.quiz_questions[i].sectionName == "") {
            quizQuestions += ",";
            quizQuestions += "null";
            quizQuestions += ",";
        } else {
            quizQuestions += ",\"";
            quizQuestions += req.body.quiz_questions[i].sectionName;
            quizQuestions += "\",";
        }

        var markingGivenInSection = false;
        for (var j = 0; j < req.body.quiz_sections_info.length; j++) {
            if (req.body.quiz_sections_info[j].name == req.body.quiz_questions[i].sectionName) {
                if (req.body.quiz_sections_info[j].posMarks != undefined && req.body.quiz_sections_info[j].negMarks != undefined) {
                    markingGivenInSection = true;
                    quizQuestions += req.body.quiz_sections_info[j].posMarks;
                    quizQuestions += ",";
                    quizQuestions += req.body.quiz_sections_info[j].negMarks;
                }
                break;
            }
        }
        if (!markingGivenInSection) {
            if (req.body.quiz_questions[i].posMarks != undefined && req.body.quiz_questions[i].negMarks != undefined) {
                quizQuestions += req.body.quiz_questions[i].posMarks;
                quizQuestions += ",";
                quizQuestions += req.body.quiz_questions[i].negMarks;
            } else {
                quizQuestions += "null,null";
            }
        }
        quizQuestions += ']';
        if (i != req.body.quiz_questions.length - 1) {
            quizQuestions += ",";
        }
    }
    quizQuestions += "]";
    var obj = {
        quiz_name: req.body.quiz_name,
        quiz_timer: quizTimer,
        quiz_timer_type: quizTimerType,
        quiz_timer_time: quizTimerTime,
        quiz_have_sections: quizHaveSections,
        quiz_section_info: quizSectionsInfo,
        quiz_questions: quizQuestions
    }
    const newQuiz = await quiz_table.create(obj)
        .then(() => {
            res.status(200).json({
                success: 1
            })
        })
        .catch(e => {
            res.status(500).json({
                success: 0,
                error: error
            })
        })
})

app.get("/questions", async (req, res) => {
    console.log("all questions request received");
    var allQuestions = await question_table.findAll();
    var dataToSend = [];
    for (var i = 0; i < allQuestions.length; i++) {
        dataToSend.push({
            id: allQuestions[i].dataValues.question_id,
            Tags1: allQuestions[i].dataValues.question_tag_1,
            Tags2: allQuestions[i].dataValues.question_tag_2,
            Question: allQuestions[i].dataValues.question_body
        });
    }
    res.send(dataToSend);
})
// {
//     "question_tag_1":"computer",
//     "question_tag_2":"quiz",
//     "question_body":"Body",
//     "question_body_img_url":"URL",
//     "question_type":"mcq",
//     "question_options":"[['body','body_url']]",
//     "scale_options":"[['scalename1','scalevalue1']]",
//     "match_options":"[['option1(a)body', 'option1(a)url', 'option1(b)body', 'option1(b)url']]",
//     "question_answer":"Ans",
//     "question_explaination":"Explain"
// }

// The disk storage engine gives you full control on storing files to disk.
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})
var upload = multer({ storage: storage })
// for multiple files
var cpUpload = upload.fields([{ name: 'question_body_img_url', maxCount: 1 }]);
app.post("/create-question", cpUpload, async (req, res) => {
    // if there is img with the body
    if (req.files.question_body_img_url.length != 0) {
        var body_img = req.files.question_body_img_url[0];
        var url = "https://storage.bunnycdn.com/" + ENV.SZ_NAME + "/" + ENV.SZ_PATH + "/" + body_img.filename;
        await fetch(url, { method: 'PUT', headers: { Accept: 'application/json', AccessKey: ENV.SZ_ACCESS_KEY }, body: fs.createReadStream(body_img.path) })
            .then(data => data.json())
            .then(jsond => console.log(jsond))
        // setting body img url 
        req.body.question_body_img_url = "https://" + ENV.PZ_HOST_NAME + ENV.SZ_PATH + "/" + body_img.filename;
    } else {
        req.body.question_body_img_url = null;
    }
    console.log(req.body.question_body_img_url);
    let {
        question_tag_1,
        question_tag_2,
        question_body,
        question_body_img_url,
        question_type,
        question_options,//[[body,body_img_url]]
        scale_options,//[[scalename1, scalevalue1]]
        match_options,//[[option1(a)body, option1(a)url, option1(b)body, option1(b)url]]
        question_answer,
        question_explanation
    } = req.body;

    const questions = await question_table.create(
        {
            question_tag_1: question_tag_1,
            question_tag_2: question_tag_2,
            question_body: question_body,
            question_body_img_url: question_body_img_url,
            question_type: question_type,
            question_options: question_options,//[[body,body_img_url]]
            scale_options: scale_options,//[[scalename1, scalevalue1]]
            match_options: match_options,//[[option1(a)body, option1(a)url, option1(b)body, option1(b)url]]
            question_answer: question_answer,
            question_explanation: question_explanation
        }
    )
        .then(() => {
            res.status(200).json({
                success: 1
            })
        })
        .catch((error) => {
            res.status(500).json({
                success: 0,
                error: error
            })
        })
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})
var upload = multer({ storage: storage })
// name of file is assumed csvFileBulk, this route will accept a csv file and create those mcq questions
app.post("/create-bulk", upload.single('bulk-file'), async (req, res) => {
    var excelData = [];
    console.log("Starting to read file");
    fs.createReadStream("./uploads/" + req.file.filename)
        .pipe(csv())
        .on('data', async data => {
            data = Object.entries(data);
            excelData.push(data);
        })
        .on('end', async () => {
            console.log("CLOSED");
            console.log("removing file");
            const commandToRun = 'rm -r ./uploads/' + req.file.filename;
            console.log(commandToRun);
            const commands = cmd.runSync(commandToRun);
            console.log(commands);
            var allPromises = excelData.map(async data => {
                var countOptions = data[8][1].split(",");
                if (countOptions.length == 1) {
                    questionType = "single_correct_question";
                } else {
                    questionType = "multiple_correct_question";
                }
                var questionOption = "[[\"";
                questionOption += data[4][1];
                questionOption += "\",null],[\"";
                questionOption += data[5][1];
                questionOption += "\",null],[\"";
                questionOption += data[6][1];
                questionOption += "\",null],[\"";
                questionOption += data[6][1];
                questionOption += "\",null]]";
                // console.log(questionOption);
                var questionAnswer = "[";
                questionAnswer += data[8][1];
                questionAnswer += "]";
                // console.log(questionAnswer);
                return question_table.create({
                    question_tag_1: data[0][1],
                    question_tag_2: data[1][1],
                    question_body: data[2][1],
                    question_type: questionType,
                    question_options: questionOption,
                    question_answer: questionAnswer
                })
            })
            const results = await Promise.all(allPromises.map(p => p.catch(e => e)));
            const validResults = results.filter(result => !(result instanceof Error));
            // console.log(validResults);
            res.sendStatus(200).json({
                success: 1
            })
        })
})
module.exports = app;