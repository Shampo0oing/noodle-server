const mongoose = require('mongoose');
const Classes = require('../db/classes');
const Dburi = 'mongodb+srv://mudy:1qORiD5tJJjIQUJh@cluster0.9ii1ept.mongodb.net/noodle?retryWrites=true&w=majority';


function db_connection(){
    mongoose.connect(Dburi, {useNewurlParser: true, useUnifiedTopology: true })
        .then((result)=>console.log('connected to db'))
        .catch((err) => console.log(err));
}

function write_class(name,sigle,link){
    const classes = new Classes({
        class_name:name,
            class_sigle: sigle,
            class_link: link
    });
    classes.save()
        .then((result) => {
            console.log(result)
        })
        .catch((err)=>{
            console.log(err)
        });
}


module.exports={db_connection,write_class};