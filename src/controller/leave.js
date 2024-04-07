import Auth from '../utils/auth.js'
import studentModel from '../models/student.js'
import leaveModel from '../models/leave.js'

//posting new leave for both user and admin
const createLeave = async (req, res) => {
    try {
        let token = req?.headers?.authorization?.split(" ")[1];
        console.log(token);
        if (!token) {
            return res.status(401).send({ message: "Unauthorized: No token provided" });
        }

        let payload = await Auth.decodeToken(token);
        if (!payload || !payload.id) {
            return res.status(401).send({ message: "Unauthorized: Invalid token" });
        }

        const student = await studentModel.findById(payload.id);

        const { reason, appliedOn } = req.body;
        const newLeave = await leaveModel.create(req.body);
        const createdLeave = await newLeave.save();
        if (newLeave) {
            // Associating leave with the student
            student.Leaves=student.Leaves.concat(createdLeave._id);

            // Saving the updated student
            await student.save();
        }
        res.status(201).send({
            message: "created",
            newLeave,
            student_Id: student.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error",error });
    }
}
//deleting leaves for both user and admin
const deleteLeave = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Deleting the leave entry
        const deletedLeave = await leaveModel.findByIdAndDelete(id);
        if (!deletedLeave) {
            return res.status(404).send({ message: "No leave record found" });
        }

        // Removing the leave reference from the associated student
        const student = await studentModel.findOneAndUpdate(
            { Leaves: id },
            { $pull: { Leaves: id } },
            { new: true }
        );
        if (!student) {
            return res.status(404).send({ message: "Associated student not found" });
        }

        // Saving the updated student
        await student.save();

        res.status(200).json({ message: "Leave deleted successfully", deletedLeave });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
};
//fetching leaves by ID, user can only looks for thier leaves and admin can also checks individual leaves of the user
const leaveById= async (req, res) => {
    try {
        const leave = await leaveModel.findById({_id:req.params.id})
        if (leave) {
         res.status(200).send({
            message:"fetched Leaves by ID",
            leave
         })   
        }        
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}
//fetching all leaves for the admin
const fetchAllLeaves = async (req, res) => {
    try {
        const studentsWithLeaves = await studentModel.aggregate([
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                Leaves: 1
              }
            }
          ]);
        res.status(200).send({
            message:"All Leaves fetched along with Leaves",
            studentsWithLeaves
        });
      } catch (error) {
        console.error('Error finding students with leaves:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
}
//fetching all leaves for the user
const fetchAllLeavesUser = async (req, res) => {
    try {
        let token = req?.headers?.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).send({ message: "Unauthorized: No token provided" });
        }

        let payload = await Auth.decodeToken(token);
        if (!payload || !payload.id) {
            return res.status(401).send({ message: "Unauthorized: Invalid token" });
        }
        // Find the student by ID
        const student = await studentModel.findById(payload.id);
        
        // Check if student is found
        if (!student) {
            return res.status(404).send({ message: "Student not found" });
        }

        // Retrieve only the leaves associated with the student
        const leaves = student.Leaves;      
        res.status(200).send({
            message:"fetched all leaves for the user",
            leaves
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }    
}

const approveLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const leave = await leaveModel.findById(leaveId);
        if (!leave) {
            return res.status(404).json({ message: "Leave data not found" });
        }

        leave.status = "approved";
        await leave.save();        
        res.status(201).send({
            message:"Leave Approved",
            leave
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
const rejectLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const leave = await leaveModel.findById(leaveId);
        if (!leave) {
            return res.status(404).json({ message: "Leave data not found" });
        }

        leave.status = "rejected";
        await leave.save();        
        res.status(201).send({
            message:"Leave rejected",
            leave
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}



export default { createLeave, deleteLeave, leaveById, fetchAllLeaves, fetchAllLeavesUser, approveLeave, rejectLeave }
