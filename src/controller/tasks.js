import classModel from '../models/classes.js'
import taskModel from '../models/tasks.js'
import studentModel from '../models/student.js'
import Auth from '../utils/auth.js'

const postTask = async (req, res) => {
  try {
    let classNum = req.params.id
    // Extract data from the request body
    const {frontEndCode,frontEndURL,backEndCode,backEndURL} = req.body;

    // Step 1: Find the class based on the day
    const foundClass = await classModel.findOne(classNum);

    if (!foundClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Step 2: Post the task for the class
    const newTask = new taskModel(req.body);
    const savedTask = await newTask.save();

    // Update the class with the new task
    foundClass.tasks = foundClass.tasks.concat(savedTask._id)

    let token = req?.headers?.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).send({ message: "Unauthorized: No token provided" });
    }
   
    // Decode token to get user payload
    let payload = await Auth.decodeToken(token);
    if (!payload || !payload.id) {
        return res.status(401).send({ message: "Unauthorized: Invalid token" });
    }
   
    // Step 3: Save task details in the student collection
    // Fetch student details based on payload id
    const student = await studentModel.findById(payload.id);    

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Step 4: Update task status
    await taskModel.updateOne({ _id: savedTask._id }, { check: true });
    
    // Update student's tasks
    student.tasks.push(savedTask._id);
    await student.save();


    // Send success response
    res.json({ message: 'Task posted and saved successfully' });
  } catch (error) {
    console.error('Error posting task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const fetchAllTasksUser = async (req,res) => {
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
    const tasks = student.tasks;      
    res.status(200).send({
        message:"fetched all Queries for the user",
        tasks
    })
} catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
}  
}

const fetchAllTasks = async (req,res) => {
  try {
    const studentsWithTasks = await studentModel.aggregate([
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            tasks: 1
          }
        }
      ]);
    res.status(200).send({
        message:"All Tasks fetched along for Admin",
        studentsWithTasks
    });
  } catch (error) {
    console.error('Error finding students for Admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }  
}

const updateTaskScore = async (req,res) => {
  try {
    const taskId = req.params.id;
    console.log(taskId);
    const task = await taskModel.findById(taskId);
    console.log(task);
    if (!task) {
        return res.status(404).json({ message: "Task data not found" });
    }

    task.score = "8";
    await task.save();        
    res.status(201).send({
        message:"Marks Updated",
        task
    })
} catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
}
}

export default {postTask, fetchAllTasksUser, fetchAllTasks, updateTaskScore};
