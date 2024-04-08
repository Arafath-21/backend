import mongoose from 'mongoose'

// defining a schema

const querySchema = new mongoose.Schema({
  queryTitle: {type: String,required: [true, "title missing"]},
  queryDesc: {type: String,required: [true, "Description missing"]},
  appliedOn: {type: Date,default: Date.now},
  status:    { type: String, enum: ['unresolved', 'resolved'], default: 'unresolved' },
  students:  { type: mongoose.Schema.Types.ObjectId, ref: 'students'}
},{
    versionKey:false,
    collection:'query'
});

// create a model
const queryModel = mongoose.model("query", querySchema);

export default queryModel
