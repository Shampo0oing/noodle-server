const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classesSchema = new Schema({
    class_name: {
        type: String,
        required: true,
    },
    class_sigle: {
        type: String,
        required: true,
    },
    class_link:{
        type: String,
        required: true,
    }
});

const Classes = mongoose.model('Classes',classesSchema);
module.exports = Classes;