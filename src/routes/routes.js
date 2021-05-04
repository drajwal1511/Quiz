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
var cors = require('cors')
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

app.post('/create',async (req, res) => {
    console.log("hit");

    //Basic concepts of this route:
    //Does the quiz have sections
    //No=>section_name=null, and set quiz_questions section_name=null, pos_marks=pos_marks, neg_marks=neq_marks
    //Yes=>For each section set quiz_questions
    console.log(req.body);
    res.sendStatus(200);
    // let {
    //     quiz_name,
    //     quiz_timer,
    //     quiz_timer_type,
    //     quiz_timer_time,
    //     quiz_have_sections,
    //     quiz_sections_info,//[[section_name,no_of_ques,no_of_ques_to_show,max_marks,pos_marks,neg_marks]]
    //     quiz_questions//[[ques_id,section_name,pos_marks,neq_marks]]
    // } = req.body;
    // sections_info = JSON.parse(quiz_sections_info)
    // questions = JSON.parse(quiz_questions)

    //Marks common for all sections
    //pos and neg marks set for quiz_questions
    //Expecting all parameter for quiz_sections_info
    //Expecting only ques_id in quiz_questions array
    // if (sections_info[0][0] == null) {
    //     for (var i = 0; i < questions.length; i++) {
    //         questions[i].push(sections_info[i][4], sections_info[i][5])
    //     }
    // }

    // //Marks common for sections
    // //section name with pos and neg marks for each section
    // for (var i = 0; i < sections_info.length; i++) {
    //     if (sections_info[i][0] != null) {
    //         for (var j = 0; j < questions.length; j++) {
    //             if (questions[j][1] == sections_info[i][0]) {
    //                 questions[j].push(sections_info[i][4], sections_info[i][5])
    //             }
    //         }
    //     }
    // }

    //Marks for each ques
    //update quiz_questions for each ques
    //Directly put data in database



    // const quiz = await sequelize.query("INSERT INTO `quiz_table`() VALUES ", 

    // { type: QueryTypes.SELECT });
    // const quizzes = await quiz_table.create(
    //     {
    //         quiz_name: quiz_name,
    //         quiz_timer: quiz_timer,
    //         quiz_timer_type: quiz_timer_type,
    //         quiz_timer_time: quiz_timer_time,
    //         quiz_have_sections: quiz_have_sections,
    //         quiz_section_info: JSON.stringify(sections_info),
    //         quiz_questions: JSON.stringify(questions)
    //     }
    // )
    //     .then(() => {
    //         res.status(200).json({
    //             success: 1
    //         })
    //     })
    //     .catch((error) => {
    //         res.status(500).json({
    //             success: 0,
    //             error: error
    //         })
    //     })
})

app.get("/questions",async (req, res) => {
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
app.post("/create-question-bulk", upload.single('csvFileBulk'), async (req, res) => {
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
            var allPromises = excelData.map(async data => {
                var countOptions = data[8][1].split(",");
                if (countOptions.length==1) {
                    questionType = "single_correct_question";
                } else {
                    questionType = "multiple_correct_question";
                }
                var questionOption = "[[";
                questionOption += data[4][1];
                questionOption += ",null],[";
                questionOption += data[5][1];
                questionOption += ",null],[";
                questionOption += data[6][1];
                questionOption += ",null],[";
                questionOption += data[6][1];
                questionOption += ",null]]";
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