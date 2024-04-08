import Auth from '../utils/auth.js'
import studentModel from '../models/student.js'
import leaveModel from '../models/leave.js'
import nodemailer from 'nodemailer'

//posting new leave for both user and admin
const createLeave = async (req, res) => {
    try {
        // Extract token from request headers
        let token = req?.headers?.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).send({ message: "Unauthorized: No token provided" });
        }
       
        // Decode token to get user payload
        let payload = await Auth.decodeToken(token);
        if (!payload || !payload.id) {
            return res.status(401).send({ message: "Unauthorized: Invalid token" });
        }
       
        // Fetch student details based on payload id
        const student = await studentModel.findById(payload.id);
       
        // Extract reason and appliedOn from request body
        const { reason, appliedOn } = req.body;
       
        // Create a new leave request
        const newLeave = await leaveModel.create({
            reason,
            appliedOn,
            student: student._id // Include student reference in leave request
        });

        // Save the new leave request
        const createdLeave = await newLeave.save();
        if (newLeave) {
            // Associating leave with the student
            student.Leaves=student.Leaves.concat(createdLeave._id);

            // Saving the updated student
            await student.save();
        }   
      //sending email for Confirm account
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD
        },
      });
      
      const sendMail = async () => {
        const info = await transporter.sendMail({
            from: `"Zen Class Admin 🙌" <${process.env.EMAIL_ADDRESS}>`,
            to: student.email,
            subject: "Zen Class Leave Request",
            html: `
            <html>
            <body>
                <p>Dear ${student.firstName},</p>
                <p>We have received a Leave Request from you on Zen Class.</p>
                <p><strong style="font-weight:bold;">Leave Reason:</strong> ${newLeave.reason}</p>
                <p><strong style="font-weight:bold;">Applied On:</strong> ${newLeave.appliedOn}</p>
                <p>Your leave request is currently <span style="font-weight:bold;">${newLeave.status}</span>.</p>
                <p>We will notify you once it's processed.</p>
                <br>
                <p>Regards,</p>
                <p>Zen Class Admin</p>
            </body>
            </html>
            `,
        });
       };    
       await sendMail();         
        // Send response
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
        const leaveId = req.params.id;
        console.log(leaveId);
        // Deleting the leave entry
        const deletedLeave = await leaveModel.findByIdAndDelete(leaveId);
        if (!deletedLeave) {
            return res.status(404).send({ message: "No leave record found" });
        }
        console.log(deletedLeave);
        // Removing the leave reference from the associated student
        const student = await studentModel.findOneAndUpdate(
            { Leaves: leaveId },
            { $pull: { Leaves: leaveId } },
            { new: true }
        );
        console.log(student);
        if (!student) {
            return res.status(404).send({ message: "Associated student not found" });
        }

        // Saving the updated student
        await student.save();

      //sending email for Confirm account
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD
        },
      });
      
      const sendMail = async () => {
        const info = await transporter.sendMail({
            from: `"Zen Class Admin 🙌" <${process.env.EMAIL_ADDRESS}>`,
            to: student.email,
            subject: "Zen Class Leave Deleted",
            html: `
            <html>
            <body>
                <p>Dear ${student.firstName},</p>
                <p>We have received a Leave Request from you on Zen Class.</p>
                <p><strong style="font-weight:bold;">Leave Reason:</strong> ${deletedLeave.reason}</p>
                <p><strong style="font-weight:bold;">Applied On:</strong> ${deletedLeave.appliedOn}</p>
                <p>Your leave request is <span style="font-weight:bold;">Deleted</span>.</p>
                <br>
                <p>Regards,</p>
                <p>Zen Class Admin</p>
            </body>
            </html>
            `,
        });
       };    
       await sendMail();           

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
//approve leave by admin
const approveLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;
        console.log(`This is ID -- ${leaveId}`);
        const leave = await leaveModel.findById(leaveId);
        console.log(`This is Leave ---- ${leave}`);
        if (!leave) {
            return res.status(404).json({ message: "Leave data not found" });
        }

        leave.status = "approved";
        await leave.save();       

        const student = await studentModel.findOneAndUpdate(
            { Leaves: leaveId },
            { new: true }
        );
        console.log(`This is student --- ${student}`);
        if (!student) {
            return res.status(404).send({ message: "Associated student not found" });
        }

        // Saving the updated student
        await student.save();   
        
      //sending email for Confirm account
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD
        },
      });
      
      const sendMail = async () => {
        const info = await transporter.sendMail({
            from: `"Zen Class Admin 🙌" <${process.env.EMAIL_ADDRESS}>`,
            to: student.email,
            subject: "Zen Class Leave Approved",
            html: `
            <html>
            <body>
                <p>Dear ${student.firstName},</p>
                <p>We have received a Leave Request from you on Zen Class.</p>
                <p><strong style="font-weight:bold;">Leave Reason:</strong> ${leave.reason}</p>
                <p><strong style="font-weight:bold;">Applied On:</strong> ${leave.appliedOn}</p>
                <p>Your leave request is currently <span style="font-weight:bold;">${leave.status}</span>.</p>
                <br>
                <p>Regards,</p>
                <p>Zen Class Admin</p>
            </body>
            </html>
            `,
        });
       };    
       await sendMail();          

        res.status(201).send({
            message:"Leave Approved",
            leave
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//reject leave by admin
const rejectLeave = async (req, res) => {
    try {
        const leaveId = req.params.id;
        const leave = await leaveModel.findById(leaveId);
        if (!leave) {
            return res.status(404).json({ message: "Leave data not found" });
        }

        leave.status = "rejected";
        await leave.save();       
        const student = await studentModel.findOneAndUpdate(
            { Leaves: leaveId },
            { new: true }
        );
        if (!student) {
            return res.status(404).send({ message: "Associated student not found" });
        }

        // Saving the updated student
        await student.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_ADDRESS,
              pass: process.env.EMAIL_PASSWORD
            },
          });
          
          const sendMail = async () => {
            const info = await transporter.sendMail({
                from: `"Zen Class Admin 🙌" <${process.env.EMAIL_ADDRESS}>`,
                to: student.email,
                subject: "Zen Class Leave Rejected",
                html: `
                <html>
                <body>
                    <p>Dear ${student.firstName},</p>
                    <p>We have received a Leave Request from you on Zen Class.</p>
                    <p><strong style="font-weight:bold;">Leave Reason:</strong> ${leave.reason}</p>
                    <p><strong style="font-weight:bold;">Applied On:</strong> ${leave.appliedOn}</p>
                    <p>Your leave request is <span style="font-weight:bold;">${leave.status}</span>.</p>
                    <br>
                    <p>Regards,</p>
                    <p>Zen Class Admin</p>
                </body>
                </html>
                `,
            });
           };    
           await sendMail(); 

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
