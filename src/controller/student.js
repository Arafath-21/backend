import studentModel from "../models/student.js";
import Auth from '../utils/auth.js'
import nodemailer from 'nodemailer'

// signing up
const signupStudent = async (req, res) => {
    try {
      const matchedStudent = await studentModel.findOne({ email:req.body.email });
      if (matchedStudent) {
        return res.status(400).send({ message: `${req.body.email} already exists, Try with another Email`});
      }

      //generating random string
  
      const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const link = `${process.env.FEURL}/confirm/${randomString}`;
      
      // hash password
      req.body.password = await Auth.hashPassword(req.body.password);
      
      //Signingup student
      const student = await studentModel.create({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        contactNumber:req.body.contactNumber,
        yearOfPassedOut:req.body.yearOfPassedOut,
        yearOfExperience:req.body.yearOfExperience,
        qualification:req.body.qualification,
        noticePeriod:req.body.noticePeriod,
        city:req.body.city,
        zip:req.body.zip,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        resetToken: randomString,
        role:req.body.role
      });
      
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
            subject: "Zen Class Confirm Account Request",
            html: `
                <html>
                <body>
                    <p>Dear ${student.firstName},</p>
                    <p>We have received a Confirm Account request from you on Zen Class.</p>
                    <p>To confirm your account, please click on the following link:</p>
                    <p><a href="${link}">${link}</a></p>
                    <p>Alternatively, you can copy and paste the link into your browser.</p>
                    <p>This link will expire in 24 hours, so be sure to use it right away.</p>
                    <br>
                    <p>Regards,</p>
                    <p>Zen Class Admin</p>
                </body>
                </html>
            `,
        });
    };    
    await sendMail();
  
      res.status(201).send({ message: `account created successfully ${student.firstName}`,student });
    } catch (error) {
      console.error("Error during signup:", error);
      return res.status(400).json({ message: "Error on sign up please try again",error });
    }
}

//Needed Validation
const updateStudent = async (req, res) => {
  try {
    // const { email, name, lName, contactNo, qualification, experience, password } = req.body;

    // Check if the student exists
    const matchedStudent = await studentModel.findOne({ _id:req.params.id });
    console.log(matchedStudent);
    if (!matchedStudent) {
      return res.status(400).send({ message: "Entered Email not found" });
    }

    // Hash the password if it's provided
    if (req.body.password) {
      req.body.password = await Auth.hashPassword(req.body.password);
    }

    // Update the student's details
    let updatedStudent = await studentModel.findByIdAndUpdate(matchedStudent.id, req.body,{new:true});
    if (updatedStudent) {      
      // Sending response
      res.status(201).json({ message: "Account updated successfully", updatedStudent });
    }

  } catch (error) {
    console.error("Error during update:", error);
    return res.status(400).json({ message: "Error on update, please try again",error });
  }
};

const confirmStudent = async (req, res) => {
  try {
    // const resetToken = req.params.resetToken;
    const matchedStudent = await studentModel.findOne({ resetToken:req.params.resetToken });
    console.log(`be reset ${matchedStudent}`);

    //if student not found throw error
    if (matchedStudent === null || matchedStudent.resetToken === "") {
      return res.status(400).json({ message: "student not exists or link expired" });
    }
    
    //confirming and updating account
    matchedStudent.verified = true;

    matchedStudent.resetToken = "";

    await studentModel.findByIdAndUpdate(matchedStudent.id, matchedStudent);

    res.status(200).json({
      message: `${matchedStudent.firstName} your account has been verified successfully`,
    });

  } catch (error) {
     return res.status(400).send({ message: "student not exists or please confirm the account, sent to you mail",error });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const matchedStudent = await studentModel.findOne({ email:req.body.email });
    // if student not exist throw error
    if (!matchedStudent) {
      return res.status(400).json({
        message: "please enter valid email / Entered mail not registered",
      });
    }

    //generating random string
    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const link = `${process.env.FEURL}/reset/${randomString}`;

    // adding reset token to student db
    matchedStudent.resetToken = randomString;

    await studentModel.findByIdAndUpdate(matchedStudent.id, matchedStudent);

    //sending email for forgotpassword

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const sendMail = async () => {
      const info = await transporter.sendMail({
          from: `"Zen Class Admin" <${process.env.EMAIL_ADDRESS}>`,
          to: matchedStudent.email,
          subject: "Zen Class Forgot Password Request",
          html: `
              <html>
              <body style="font-family: Arial, sans-serif; font-size: 14px;">
                  <p>Dear ${matchedStudent.firstName},</p>
                  <p>We have received a Forgot password request from you on Zen Class.</p>
                  <p>To reset your password, please click on the following link:</p>
                  <p><a href="${link}" style="text-decoration: none; color: #007bff;">${link}</a></p>
                  <p>Alternatively, you can copy and paste the link into your browser.</p>
                  <p>This link will expire in 24 hours, so be sure to use it right away.</p>
                  <br>
                  <p>Regards,</p>
                  <p>Zen Class Admin</p>
              </body>
              </html>
          `,
      });
    };
    await sendMail().then(() => {
        return res.status(200).send({ message: `Mail has been send to ${matchedStudent.email}` });
      }).catch((err) => res.status(500).send(err));

    
  } catch (error) {
    return res.status(400).send({ message: "Error on updating please try again later",error });
  }
};

const resetPassword = async (req, res) => {
  try {
    
    // finding matched student
    const matchedStudent = await studentModel.findOne({ resetToken:req.params.resetToken });
    console.log(matchedStudent);
    //if student not found throw error
    if (matchedStudent === "null" || matchedStudent.resetToken === "") {
      return res.status(400).json({ message: "student not exists or reset link expired" });
    }

    // hasing the new password and update
  
    req.body.password = await Auth.hashPassword(req.body.password)

    matchedStudent.password = req.body.password;
    matchedStudent.resetToken = "";

    await studentModel.findByIdAndUpdate(matchedStudent.id, matchedStudent,{new:true});
 
    //sending response

    res.status(200).json({
      message: `${matchedStudent.firstName} password has been updated successfully`,matchedStudent
    });

    //
  } catch (error) {
    return res.status(500).json({ message:error.message });
  }
};

const login = async (req, res) => {
  try {
    // search and find the document of the student with email
    const student = await studentModel.findOne({ email:req.body.email });

    if (student) {
        if (!student.verified) {
            return res.status(400).json({ message: "Account not verfied, kindly check your Email" });
          }
        if (await Auth.hashCompare(req.body.password,student.password)) {
            let studentToken = await Auth.createToken({
                name: student.firstName,
                id: student._id,
                role:student.role
            })
            return res.status(200).send({
                message:'login sucess',
                firstName:student.firstName,
                role:student.role,
                id:student._id,
                studentToken
            })
        } else {
            return res.status(400).json({ message: "password incorrect" });  
        }      
            
    }else{
        return res.status(400).send({ message: `Student with ${req.body.email} does not exist's` });
    }
} catch (error) {
    res.status(500).send({
        message:error.message || "Internal Server Error"
    })
}
};


export default {signupStudent,updateStudent,confirmStudent,forgotPassword,resetPassword,login}