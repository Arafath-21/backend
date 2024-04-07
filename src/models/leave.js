import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  reason: { type: String, required: true },
  appliedOn: { type: Date, default: Date.now, unique:[true,'On this date you already applied leave'] },
  students: { type: mongoose.Schema.Types.ObjectId, ref: 'students'},
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
},{
    versionKey:false,
    collection:'Leaves'
});

// create a model
const leaveModel = mongoose.model( "Leaves",leaveSchema);

export default leaveModel