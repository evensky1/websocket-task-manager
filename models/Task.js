const {Schema, model} = require('mongoose')

const Task = new Schema({
    key: {type: String, required: true},
    summary: {type: String, required: true},
    postDate: {type: String, required: true},
    status: {type: String, required: true},
    fileName: {type: String, required: true},
    fid: {type: String, required: true},
    dueTo: {type: String, required: true}
})

module.exports = model('Task', Task)