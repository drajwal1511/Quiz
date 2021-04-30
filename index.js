const express=require('express');
const app=express();
const routes=require('./src/routes/routes');
const {PORT}=require('./env');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

require('./src/models/question_table');
require('./src/models/quiz_table');


//Swagger initialization
const swaggerOptions={
    swaggerDefinition:{
        info:{
            title: 'Checkout',
            description: 'Checkout Documentation',
            contact: {
                name: "Priyanka Asrani",
            },
            servers: ["http://localhost:5003"]
        }
    },
    apis: ["index.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


/**
 * @swagger
 * /create:
 *  post:
 *    tags:
 *      - create quiz
 *    summary: creating quiz
 *    parameters:
 *      - in: body
 *        name: body
 *        description: creating quiz
 *        required: true
 *        example: {"quiz_name":"Chem","quiz_timer":"Yes","quiz_timer_type":"whole","quiz_timer_time":"demo","quiz_have_sections":"No","quiz_sections_info":"[[null,15,15,15,1,0]]","quiz_questions":"[[1,null]]"}
 *    responses:
 *      '200':
 *        description: successful operation
 */


/**
 * @swagger
 * /create-question:
 *  post:
 *    tags:
 *      - create question
 *    summary: creating question
 *    parameters:
 *      - in: body
 *        name: body
 *        description: creating question
 *        required: true
 *        example: {"question_tag_1":"computer","question_tag_2":"quiz","question_body":"Body","question_body_img_url":"URL","question_type":"mcq","question_options":"[['body','body_url']]","scale_options":"[['scalename1','scalevalue1']]","match_options":"[['option1(a)body', 'option1(a)url', 'option1(b)body', 'option1(b)url']]","question_answer":"Ans","question_explaination":"Explain"}
 *    responses:
 *      '200':
 *        description: successful operation
 */

app.use('/',routes);

app.listen(PORT,()=>{
    console.log("Server started");
})