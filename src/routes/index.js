// Importing the Express framework to create router instances
import express from 'express';

// Importing route handlers for different endpoints
import stduentRoutes from './student.js'; // Importing routes related to student operations
import leaveRoutes from './leave.js'; // Importing routes related to leave management
import queryRoutes from './query.js'; // Importing routes related to queries
import taskRoutes from './tasks.js'; // Importing routes related to task management
import classRoutes from './classes.js'

// Creating a new router instance using Express
const router = express.Router();

// Mounting route handlers for respective endpoints
router.use(stduentRoutes); // Mounting student routes
router.use(leaveRoutes); // Mounting leave routes
router.use(queryRoutes); // Mounting query routes
router.use(taskRoutes); // Mounting task routes
router.use(classRoutes)

// Exporting the configured router to be used in the main application
export default router;
