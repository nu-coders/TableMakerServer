const {db} = require('./firebase.js');
const { MongoClient } = require('mongodb');
const url = "mongodb://testing:test0*Ing%23@204.216.218.61:27017/";
const dayjs = require('dayjs');
const courses = require('./coursesspring23.json');
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween)

const connect = async function(){
    try {
        const client = new MongoClient(url);
        console.log("Connected to mongoDB");
        return await client.connect();
    } catch (e) {
        console.log(e);
        return e;
    }
}
    
const getAllDocsMongo = async function(){
    const client = new MongoClient(url);
    const courses = await client.db("tableMaker").collection("testing").find({}).toArray();
    console.log(courses);
    return courses;
}

const deleteDoc = async function(id){
    db.collection('courses').doc(id).delete().then(() => {
        console.log('Document successfully deleted!');
    }).catch((error) => {
        console.error('Error removing document: ', error);
    });
}
const addDoc  = async function(){
    const docRef = db.collection('courses').doc();

    await docRef.set({
        test: "test",
        id: docRef.id
    })  
} 

const addDocJson  = async function(course){
    const docRef = db.collection('courses').doc();
    let sectionLetter = "";
    let sectionNumber = ""
    sectionNumber = course.section;

    if(course.eventSubType!="Lecture"&&course.courseType!="Thesis"){
        console.log(course.eventSubType);
        sectionLetter = course.section.substring(course.section.length-1,course.section.length);
        sectionNumber = course.section.substring(0,course.section.length-1);
    }
    console.log(course.eventName+" "+course.eventId);
    await docRef.set({
        id : docRef.id,
        credits : course.credits,
        courseId: course.eventId,
        courseName: course.eventName,
        courseType: course.eventSubType,
        instructors: course.instructors,
        maxSeats: course.maximumSeats,
        schedule: course.schedules,
        seatsLeft: course.seatsLeft,
        section: course.section,
        sectionLetter: sectionLetter,
        sectionNumber: sectionNumber,
    }).then(()=>{
        console.log("Uploaded "+ docRef.id);
    })
} 

const coursesUploader = async function(){
    courses.map(async(course)=>{
        await addDocJson(course).then(()=>{
            console.log("Finished Uploading ");
    });

    })
}

const getCourseById = async function(id){
    const course = await db.collection('courses').doc(id).get();
    //console.log(course.id, '=>', course.data());
    return course.data();
}

const getAllCourses = async function(){
    const client = new MongoClient(url);
    const courses = await client.db("tableMaker").collection("testing").find({}).toArray();
    console.log(courses);
    return courses;
}

const getAllCoursesNamesCodes = async function(){
    const client = new MongoClient(url);
    const docs = await client.db("tableMaker").collection("testing").find({}).toArray();
    let courses = [];
    docs.forEach((course)=>{
        console.log(course.courseId+" - "+course.courseName);
        courses.push(course.courseId+" - "+course.courseName);
    })
    
    
    return Array.from(new Set(courses));
}
const getCourseByName = async function(name){
    let courses = [];
    const snapshot = await db.collection('courses').where('courseName','==',name).get();
    snapshot.forEach((course) => {
        //console.log(course.id, '=>', course.data());
        courses.push(course.data());
    });    
    return courses;
}

const getCourseByCourseId = async function(courseId){
    let courses = [];
    const snapshot = await db.collection('courses').where('courseId','==',courseId).get();
    snapshot.forEach((course) => {
        //console.log(course.id, '=>', course.data());
        courses.push(course.data());
    });    
    return courses;
}

const getListCoursesByCourseId = async function(coursesId){
    const client = new MongoClient(url);

    console.log(coursesId)
    let allCourses = [];
    for (const courseId of coursesId){
        let courses = [];
        const snapshot =  await client.db("tableMaker").collection("testing").find({'courseId': courseId}).toArray();
        await snapshot.forEach((course) => {
            courses.push(course);
        }); 
        allCourses.push(courses);
    }
    return allCourses;
}


const getListCoursesByCourseIdSegmented = async function(coursesId){
    
    const client = new MongoClient(url);

    let allCourses = [];
    for (const courseId of coursesId){
        let courses = [];
        const snapshot = await db.collection('courses').where('courseId','==',courseId).get();
        await snapshot.forEach((course) => {
            courses.push(course.data());
        }); 
        allCourses.push(courses);
    }
    return allCourses;
}

const cartesian =async(a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));


const createCourseOptionsList = async function(coursesId){
    let coursesList = await getListCoursesByCourseId(coursesId);
    finalCoursesOutput=[];
    //console.log(coursesList);
    for (const course of coursesList){
        let singleCourseFinal = [];
        //Get Number of Sections
        //Looping on a single CourseID list
        let sectionNumbers = [];
        for (const section of course){
            //console.log(section);
            sectionNumbers.push(section.sectionNumber);
        }
        let uniqueSectionNumbers = [...new Set(sectionNumbers)];
        //console.log(uniqueSectionNumbers);
        for (const sectionNumber of uniqueSectionNumbers){
            let sectionCourses = [];
            for (const section of course){
                if(section.sectionNumber==sectionNumber){
                    sectionCourses.push(section);
                }
            }
            //console.log(sectionCourses);
            let segmentedCourseByType = [];
            let courseTypes = [];
            for (const section of sectionCourses){
                courseTypes.push(section.courseType);
            }
            let uniqueCourseTypes = [...new Set(courseTypes)];
            //console.log(uniqueCourseTypes);
            for (const courseType of uniqueCourseTypes){
                let courseTypeCourses = [];
                for (const section of sectionCourses){
                    if(section.courseType==courseType){
                        courseTypeCourses.push(section);
                    }
                }
                //console.log(courseTypeCourses);
                segmentedCourseByType.push(courseTypeCourses);
            }
            //console.log("//////////////////////////");
            //console.log(segmentedCourseByType);
            let courseOption = await cartesian(segmentedCourseByType);
            singleCourseFinal.push(courseOption);
        }
        let singleCourseFinalUnique = [...new Set(singleCourseFinal)];
        let singleCourseFinalUniqueFlattened = singleCourseFinalUnique.flat();
        finalCoursesOutput.push(singleCourseFinalUniqueFlattened);
    }

    return finalCoursesOutput;
}

const createTablesNoChecks = async function(coursesId){
    let coursesOptions = await createCourseOptionsList(coursesId);
    let tablesNoChecks = await cartesian(coursesOptions)
    // console.log(tablesNoChecks.length);
    //console.log(dayjs('10:30 AM', 'h:m a').format('h:m'));
    //console.log()
    // console.log(dayjs('2019-01-25').format('DD/MM/YYYY'));
    // console.log(dayjs('10:30 AM', 'h:m a').isBetween(dayjs('10:30 AM', 'h:m a'), dayjs('12:30 AM', 'h:m a'), '[]'));

    const startTime = dayjs('10:29 AM', 'HH:mm').subtract(1, 'minute');
    const endTime = dayjs('12:30 AM', 'HH:mm').add(1, 'minute');

    const testTime1 = dayjs('10:30 AM', 'HH:mm');
    // console.log(testTime1.isBetween(startTime, endTime, 'minute', '[]'));  // false
    
    // for(const course of coursesOptions){
    //     console.log(course);
    // }
    //console.log("number of tables created "+ tablesNoChecks.length);	
    return tablesNoChecks;
}

const removeClashes = async function(coursesId){
    console.log("removing clashes");
    console.log(coursesId)
    let tableOptions = await createTablesNoChecks(coursesId);
    let cleanTableOptions = [];
    let i=0;
    for(const table of tableOptions){
        let clash = false;
        //console.log("\n\n\ntable number "+i);
        for(const course of table){
            if(course.seatsLeft == 0){
                clash = true;
            }
            let courseStartTime = course.schedule[0].startTime.split(' ')[0];
            let courseEndTime = course.schedule[0].endTime.split(' ')[0];
            let courseDay = course.schedule[0].dayDesc;
            for(const course2 of table){
                let courseStartTime2 = course2.schedule[0].startTime.split(' ')[0];
                let courseEndTime2 = course2.schedule[0].endTime.split(' ')[0];
                let courseDay2 = course2.schedule[0].dayDesc;
                //console.log(courseDay+" "+courseDay2);
                if(courseDay==courseDay2&&(course!=course2)){
                    const startTime = dayjs(courseStartTime, 'HH:mm').add(1, 'minute');
                    const endTime = dayjs(courseEndTime, 'HH:mm').subtract(1, 'minute');
                    const startTime2 = dayjs(courseStartTime2, 'HH:mm').add(1, 'minute');
                    const endTime2 = dayjs(courseEndTime2, 'HH:mm').subtract(1, 'minute');
                    if(startTime.isBetween(startTime2, endTime2, 'minute', '()') || endTime.isBetween(startTime2, endTime2, 'minute', '[]')){
                        clash=true;
                        //console.log("clash found in table "+course.courseName + "  "+course2.courseName+startTime+" "+endTime+" "+startTime2+" "+endTime2);
                    }

                //    if((courseStartTime <= courseEndTime2)  &&  (courseEndTime >= courseStartTime2)){
                //         clash=true;
                //     } 
                }
            }
        }
        i++;
        if(!clash){
            //console.log("valid!!");
            cleanTableOptions.push(table);
        }
    }
    console.log(cleanTableOptions.length);
    return cleanTableOptions;
}

const createTableFiltered = async function(coursesId, filters){
    let tableOptions = await removeClashes(coursesId);
    let filteredTableOptions = [];
    let i=0;
    for(const table of tableOptions){
        let isComplying = true;
        //console.log("\n\n\ntable number "+i);
        let tableDaysToGo = [];
        for(const course of table){
            let courseDay = course.schedule[0].dayDesc;
            tableDaysToGo.push(courseDay);
            if(filters.DaysToGo!=null){
                if(!filters.DaysToGo.includes(courseDay)){
                //console.log("not valid days to go"+ courseDay);
                    isComplying=false;
                } 
            }
            
        }
        i++;
        let tableDaysToGoUnique = [...new Set(tableDaysToGo)];
        //console.log(tableDaysToGoUnique.length)
        if(filters.noDays!=null){
            if(tableDaysToGoUnique.length>filters.noDays){
                //console.log("not valid number of days");
                isComplying=false;
            }
        }
        if(isComplying){
            //console.log("valid!!");
            filteredTableOptions.push(table);
        }
    }
    console.log(filteredTableOptions.length);
    return filteredTableOptions;
}
    
const saveTable = async function(userId, table){
    const userRef = await db.collection('users').doc(userId);
    await userRef.set({
        hasTable: true,
        table: table,
    },{ merge: true }).then(()=>{
        console.log("Uploaded "+ userRef.id);
        return userRef.id;
    })
}

const getSavedTable = async function(userId){
    const course = await db.collection('users').doc(userId).get();
    return course.data().table;
}

module.exports = {getAllDocsMongo, connect, getAllCoursesNamesCodes,getSavedTable, saveTable, createTableFiltered,removeClashes,createTablesNoChecks, coursesUploader, getAllCourses, getCourseByCourseId, getCourseById, getCourseByName, getListCoursesByCourseId, createCourseOptionsList};