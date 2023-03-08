const express = require('express');
const {getAllDocsMongo, connect, getSavedTable,saveTable, getAllCoursesNamesCodes, createTableFiltered,removeClashes,createTablesNoChecks, coursesUploader, getAllCourses, getCourseByCourseId, getCourseById, getCourseByName, getListCoursesByCourseId, createCourseOptionsList} = require('./index.js');
const cors = require('cors')

const PORT = process.env.PORT || 8090;

const app = express();
app.use(express.json());



app.use(cors())
app.get('/listAllCourses', async(req, res) => {
    res.send(await getAllCourses());
})

app.get('/getAllDocsMongo' , async(req, res) => {
    res.send(await getAllDocsMongo());
})
app.get('/getAllCourseNames', async(req, res) => {
    try{
        res.send(await getAllCoursesNamesCodes());
        console.log("data");
        } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
    
})

app.get('/uploadAll', async(req, res) => {
    res.send(await coursesUploader());
})

app.get('/getCourseById', async(req, res) => {
    console.log("Req body is %j" , req.body);
    res.send(await getCourseByCourseId(req.query.id));
})


app.get('/getListCoursesByCourseId', async(req, res) => {
    console.log("Req body is %j" , req.body);
    try {   
        res.send(await getListCoursesByCourseId(req.body.id));
        
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
})

app.get('/createTable', async(req, res) => {
    console.log("Req body is %j" , req.body);
    try {   
        res.send(await createTablesNoChecks(req.body.id));
        
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
})

app.post('/createTableNoClash', async(req, res) => {
    console.log("Req body is %j" , req.body);
    if(req.body.useFilters == false){
        try {   
            console.log("inside filters false")
            res.send(await removeClashes(req.body.id));
            
        } catch(e) {
            console.log(e);
            res.sendStatus(500);
        }
    }else if(req.body.useFilters == true){
        try {   
            console.log("inside filters true")
            res.send(await createTableFiltered(req.body.id,req.body.filters));
            
        } catch(e) {
            console.log(e);
            res.sendStatus(500);
        }
    }
})

app.post('/saveTable', async(req, res) => {
    console.log("Req body is %j" , req.body);
    try {
        res.send(await saveTable(req.body.userId,req.body.table));
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
})

app.get('/getSavedTable', async(req, res) => {
    console.log("Req body is %j" , req.body);
    try {
        res.send(await getSavedTable(req.body.userId));
    } catch(e) {
        console.log(e);
        res.sendStatus(500);
    }
})

app.listen(PORT, function () {
    console.log(`Demo project at: ${PORT}!`); 
});

