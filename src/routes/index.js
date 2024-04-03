import express from 'express'
import stduentRoutes from './student.js'
const router = express.Router()

router.use(stduentRoutes)

export default router