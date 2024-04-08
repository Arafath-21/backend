import mongoose from "mongoose";

let classSchema = new mongoose.Schema({
    status:{type:Boolean,default:false},
    no:{type:Number,unique:true},
    title:{type:String,required:[true,'title is required']},
    date:{type:String,required:[true,'class date should be provided']},
    day:{type:String,required:[true,'please say which day will class takes place']},
    time:{type:String,required:[true,'please say the timings for the class']},
    contents: [{ type: String }],
    tasks:[{type:mongoose.Schema.Types.ObjectId,ref:'tasks'}]
},{
    collection:'class',
    versionKey:false    
})

const classModel = mongoose.model('class',classSchema)

export default classModel