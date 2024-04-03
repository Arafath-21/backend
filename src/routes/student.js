import express from 'express'
import studentController from '../controller/student.js'
import Validate from '../middleware/Validate.js';
const router = express.Router()

router.post('/signup',studentController.signupStudent);
router.patch("/confirm/:resetToken", studentController.confirmStudent);
router.put('/update/:id',Validate,studentController.updateStudent);
router.patch("/forgot", studentController.forgotPassword);
router.patch("/reset/:resetToken",studentController.resetPassword);
router.post('/login',studentController.login)

export default router;

