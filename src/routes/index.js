import express from 'express'
import stduentRoutes from './student.js'
import leaveRoutes from './leave.js'
const router = express.Router()

router.use(stduentRoutes);
router.use(leaveRoutes);

export default router