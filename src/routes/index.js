import express from 'express'
import stduentRoutes from './student.js'
import leaveRoutes from './leave.js'
import queryRoutes from './query.js'
const router = express.Router()

router.use(stduentRoutes);
router.use(leaveRoutes);
router.use(queryRoutes);

export default router