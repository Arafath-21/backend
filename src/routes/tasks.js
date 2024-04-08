import express from 'express'
import taskController from '../controller/tasks.js'
import Validate from '../middleware/Validate.js'
import AdminGuard from '../middleware/AdminGuard.js'
const router = express.Router()

// Posting a Task

router.post('/task', Validate, taskController.postTask)
router.get('/task',Validate, taskController.fetchAllTasksUser)
router.get('/tasks',Validate, AdminGuard, taskController.fetchAllTasks)
router.put('/task/:id',Validate, AdminGuard, taskController.updateTaskScore)

export default router;
 