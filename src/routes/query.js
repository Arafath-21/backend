import express from 'express'
import queryController from '../controller/query.js'
import Validate from '../middleware/Validate.js';
import AdminGuard from '../middleware/AdminGuard.js'
const router = express.Router()

//create query
router.post('/query',Validate,queryController.createQuery);
//deleting query
router.delete("/query/:id",Validate,queryController.deleteQuery);
//fetching querys by id
router.get("/query/:id",Validate,queryController.queryById);
//fetching all querys for the admin
router.get('/query',Validate, AdminGuard, queryController.fetchAllQueries)
//fetching all the query user
router.get('/queries',Validate, queryController.fetchAllQueriesUser)
//approve the query by admin
router.put('/resolveQuery/:id',Validate, AdminGuard, queryController.resolveQuery)

export default router;