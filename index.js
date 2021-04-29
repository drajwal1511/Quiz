const express=require('express');
const app=express();
const routes=require('./src/routes/routes');
const {PORT}=require('./env');

require('./src/models/question_table');
require('./src/models/quiz_table');

app.use('/',routes);

app.listen(PORT,()=>{
    console.log("Server started");
})