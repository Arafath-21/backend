import mongoose from 'mongoose';


const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

// defining a schema
const studentSchema = new mongoose.Schema({
  
  firstName: {type: String},
  lastName: {type: String},
  email:{type:String,required:[true,'Email is required'],validate:{validator: (value)=>validateEmail(value)},unique: [true, "email already taken"]},
  contactNumber: {type: Number},
  qualification: {type: String},
  yearOfPassedOut:{type:Number},
  yearOfExperience: {type: Number},
  noticePeriod:{type:Number},
  city:{type:String},
  zip:{type:String},
  password: {type: String,required: [true, "please add password"]},
  confirmPassword: {type: String},
  batch: {type: String,default: "Batch 51"},
  resetToken: {type: String},
  codeKata: {type: String,default: "0"},
  webKata: {type: String,default: "0"},
  verified: {type: Boolean,default: false},  
  mockInterview: {type: String,default: "0"},
  isMentor: {type: Boolean,default: false},
  role: {type: String,default: "student"},
  Leaves: [{type: mongoose.Schema.Types.ObjectId,ref: "Leaves"}],
  query: [{type: mongoose.Schema.Types.ObjectId,ref: "query"}],
  portfolio: [{type: mongoose.Schema.Types.ObjectId,ref: "Portfolio"}],
  capstone: [{type: mongoose.Schema.Types.ObjectId,ref: "Capstone"}],
  webcode: [{type: mongoose.Schema.Types.ObjectId,ref: "Webcode"}],
  mock: [{type: mongoose.Schema.Types.ObjectId,ref: "Mock"}],
  task: [{type: mongoose.Schema.Types.ObjectId,ref: "Task"}]
},{
    versionKey:false,
    collection:'students'
});

// create a model
const studentModel = mongoose.model( "students",studentSchema);

export default studentModel