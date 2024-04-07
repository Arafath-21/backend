import express from 'express'
import leaveController from '../controller/leave.js'
import Validate from '../middleware/Validate.js';
import AdminGuard from '../middleware/AdminGuard.js'
const router = express.Router()

//create leave
router.post('/leave',Validate,leaveController.createLeave);
//deleting leave
router.delete("/leave/:id",Validate,leaveController.deleteLeave);
//fetching leaves by id
router.get("/leave/:id",Validate,leaveController.leaveById);
//fetching all leaves for the admin
router.get('/leave',Validate, AdminGuard, leaveController.fetchAllLeaves)
//fetching all the leave user
router.get('/leaves',Validate, leaveController.fetchAllLeavesUser)
//approve the leave by admin
router.put('/approveLeave/:id',Validate, AdminGuard, leaveController.approveLeave)
//reject the leave by admin
router.put('/rejectLeave/:id',Validate, AdminGuard, leaveController.rejectLeave)

export default router;

