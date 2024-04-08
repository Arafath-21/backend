import express from 'express';
import classController from '../controller/classes.js'
import Validate from '../middleware/Validate.js';
import AdminGuard from '../middleware/AdminGuard.js';
const router = express.Router();

// Route to create a new class
router.post('/class',Validate,AdminGuard,classController.createClass);

// Route to get all classes
router.get('/class',Validate,AdminGuard,classController.getAllClasses);

// Route to get a class by ID  
router.get('/class/:id',Validate,classController.getClassById)

//Route to update the class by ID
router.put('/class/:id',Validate,AdminGuard,classController.editClassById);

//Route to update the class by ID
router.delete('/class/:id',Validate,AdminGuard,classController.deleteClassById);

export default router