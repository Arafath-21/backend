import mongoose from 'mongoose'

// defining a schema

const taskSchema = new mongoose.Schema({
  frontEndCode: {type: String},
  frontEndURL: {type: String},
  backEndCode: {type: String},
  backEndURL: {type: String},
  score: {type: String,default: "Yet to be graded"},
  submittedOn: {type: Date,default: Date.now},
  check: {type: Boolean,default:false},
  students: { type: mongoose.Schema.Types.ObjectId, ref: 'students'}
},{
    versionKey:false,
    collection:'tasks'
});

// create a model
const taskModel = mongoose.model( "tasks",taskSchema);

export default taskModel
