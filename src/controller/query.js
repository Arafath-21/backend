import Auth from '../utils/auth.js'
import studentModel from '../models/student.js'
import queryModel from '../models/query.js'

//posting new query for both user and admin
const createQuery = async (req, res) => {
    try {
        // Extract token from request headers
        let token = req?.headers?.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).send({ message: "Unauthorized: No token provided" });
        }
       
        // Decode token to get user payload
        let payload = await Auth.decodeToken(token);
        if (!payload || !payload.id) {
            return res.status(401).send({ message: "Unauthorized: Invalid token" });
        }
       
        // Fetch student details based on payload id
        const student = await studentModel.findById(payload.id);
       
        // Extract data from request body
        const { queryTitle,queryDesc} = req.body;
       
        // Create a new query request
        const newQuery = await queryModel.create({
            queryTitle:queryTitle,
            queryDesc:queryDesc,
            student: student._id // Include student reference in leave request
        });

        // Save the new query request
        const createdQuery = await newQuery.save();
        if (createdQuery) {
            // Associating leave with the student
            student.query=student.query.concat(createdQuery._id);

            // Saving the updated student
            await student.save();
        }    
        // Send response
        res.status(201).send({
            message: "created",
            newQuery,
            student_Id: student.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error",error });
    }
}
//deleting query for both user and admin
const deleteQuery = async (req, res) => {
    try {
        const queryId = req.params.id;
        console.log(queryId);
        // Deleting the query entry
        const deletedQuery = await queryModel.findByIdAndDelete(queryId);
        if (!deletedQuery) {
            return res.status(404).send({ message: "No Query found" });
        }
        console.log(deletedQuery);
        // Removing the Query reference from the associated student
        const student = await studentModel.findOneAndUpdate(
            { query: queryId },
            { $pull: { query: queryId } },
            { new: true }
        );
        if (!student) {
            return res.status(404).send({ message: "Associated student not found" });
        }else{
            // Saving the updated student
            await student.save();
    
            res.status(200).json({ message: "Query deleted successfully", deletedQuery });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error", error });
    }
};
//fetching queries by ID, user can only looks for thier queries and admin can also checks individual queries of the user
const queryById= async (req, res) => {
    try {
        const query = await queryModel.findById({_id:req.params.id})
        if (query) {
         res.status(200).send({
            message:"fetched queries by ID",
            query
         })   
        }        
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error"|| error });
    }
}
//fetching all queries for the admin
const fetchAllQueries = async (req, res) => {
    try {
        const studentsWithQueries = await studentModel.aggregate([
            {
              $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                query: 1
              }
            }
          ]);
        res.status(200).send({
            message:"All Queries fetched along for Admin",
            studentsWithQueries
        });
      } catch (error) {
        console.error('Error finding students for Admin:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
}
//fetching all queries for the user
const fetchAllQueriesUser = async (req, res) => {
    try {
        let token = req?.headers?.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).send({ message: "Unauthorized: No token provided" });
        }

        let payload = await Auth.decodeToken(token);
        if (!payload || !payload.id) {
            return res.status(401).send({ message: "Unauthorized: Invalid token" });
        }
        // Find the student by ID
        const student = await studentModel.findById(payload.id);
        
        // Check if student is found
        if (!student) {
            return res.status(404).send({ message: "Student not found" });
        }

        // Retrieve only the leaves associated with the student
        const queries = student.query;      
        res.status(200).send({
            message:"fetched all Queries for the user",
            queries
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }    
}
//Resolve query by admin
const resolveQuery = async (req, res) => {
    try {
        const queryId = req.params.id;
        const query = await queryModel.findById(queryId);
        if (!query) {
            return res.status(404).json({ message: "query data not found" });
        }

        query.status = "resolved";
        await query.save();        
        res.status(201).send({
            message:"query resolved",
            query
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}



export default { createQuery, deleteQuery, queryById, fetchAllQueries, fetchAllQueriesUser, resolveQuery}
