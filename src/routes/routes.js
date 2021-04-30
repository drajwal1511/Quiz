const express=require('express');
const app=express();
const quiz_table=require('../models/quiz_table');
const question_table=require('../models/question_table');
const sequelize=require('sequelize');
require('../db/sql');

app.use(express.json())


// {
//     "quiz_id":1,
//     "quiz_name":"Chem",
//     "quiz_timer":"Yes",
//     "quiz_timer_type":"whole",
//     "quiz_timer_time":"demo",
//     "quiz_have_sections":"No",
//     "quiz_sections_info":"[[null,15,15,15,1,0]]",
//     "quiz_questions":"[[1]]"
// }


// {
//     "quiz_id":1,
//     "quiz_name":"Chem",
//     "quiz_timer":"Yes",
//     "quiz_timer_type":"whole",
//     "quiz_timer_time":"demo",
//     "quiz_have_sections":"Yes",
//     "quiz_sections_info":"[[1,15,15,15,1,0],[2,15,15,30,2,0]]",
//     "quiz_questions":"[[1,1],[2,2],[3,2],[4,1]]"
// }

app.post('/create',async(req,res)=>{

    //Basic concepts of this route:
    //Does the quiz have sections
    //No=>section_name=null, and set quiz_questions section_name=null, pos_marks=pos_marks, neg_marks=neq_marks
    //Yes=>For each section set quiz_questions

    let {
        quiz_id,
        quiz_name,
        quiz_timer,
        quiz_timer_type,
        quiz_timer_time,
        quiz_have_sections,
        quiz_sections_info,//[[section_name,no_of_ques,no_of_ques_to_show,max_marks,pos_marks,neg_marks]]
        quiz_questions//[[ques_id,section_name,pos_marks,neq_marks]]
    }=req.body;

    sections_info=JSON.parse(quiz_sections_info)
    questions=JSON.parse(quiz_questions)

    //Marks common for all sections
    //pos and neg marks set for quiz_questions
    //Expecting all parameter for quiz_sections_info
    //Expecting only ques_id in quiz_questions array
    if(sections_info[0][0]==null){
        for(var i=0;i<questions.length;i++){
            questions[i].push(sections_info[0][0],sections_info[i][4],sections_info[i][5])
        }
    }

    //Marks common for sections
    //section name with pos and neg marks for each section
    for(var i=0;i<sections_info.length;i++){
        if(sections_info[i][0]!=null){
            for(var j=0;j<questions.length;j++){
                if(questions[j][1]==sections_info[i][0]){
                    questions[j].push(sections_info[i][4],sections_info[i][5])
                }
            }
        }
    }

    //Marks for each ques
    //update quiz_questions for each ques
    //Directly put data in database


    
    // const quiz = await sequelize.query("INSERT INTO `quiz_table`() VALUES ", 
    
    // { type: QueryTypes.SELECT });
    const quizzes = await quiz_table.create(
        { 
            quiz_name:quiz_name, 
            quiz_timer:quiz_timer, 
            quiz_timer_type:quiz_timer_type, 
            quiz_timer_time:quiz_timer_time, 
            quiz_have_sections:quiz_have_sections,
            quiz_section_info:JSON.stringify(sections_info),
            quiz_questions:JSON.stringify(questions)
        }
    )
    .then(()=>{
        res.status(200).json({
            success:1
        })
    })
    .catch((error)=>{
        res.status(500).json({
            success:0,
            error:error
        })
    })
})


// {
//     "question_id":1,
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

app.post("/create-question",async(req,res)=>{
    let {
        question_id,
        question_tag_1,
        question_tag_2,
        question_body,
        question_body_img_url,
        question_type,
        question_options,//[[body,body_img_url]]
        scale_options,//[[scalename1, scalevalue1]]
        match_options,//[[option1(a)body, option1(a)url, option1(b)body, option1(b)url]]
        question_answer,
        question_explaination
    }=req.body;

    const questions = await question_table.create(
        { 
            question_tag_1:question_tag_1,
            question_tag_2:question_tag_2,
            question_body:question_body,
            question_body_img_url:question_body_img_url,
            question_type:question_type,
            question_options:question_options,//[[body,body_img_url]]
            scale_options:scale_options,//[[scalename1, scalevalue1]]
            match_options:match_options,//[[option1(a)body, option1(a)url, option1(b)body, option1(b)url]]
            question_answer:question_answer,
            question_explaination:question_explaination
        }
    )
    .then(()=>{
        res.status(200).json({
            success:1
        })
    })
    .catch((error)=>{
        res.status(500).json({
            success:0,
            error:error
        })
    })
})

module.exports=app;