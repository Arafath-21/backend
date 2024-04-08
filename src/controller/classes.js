import classModel from '../models/classes.js'

// Create a new class
const createClass = async (req, res) => {
    try {
        let classe = await classModel.findOne({no:req.body.no})
        if(!classe){
            const newClass = await classModel.create(req.body);
            res.status(201).send(newClass);
        }else{
            res.status(402).send({
                message:"the class should be unique"
            })
        }
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
};

// Get all classes
const getAllClasses = async (req, res) => {
    try {
        const classes = await classModel.find();
        res.status(200).send({
            message:"fetched all classes",
            classes
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Get class by ID
const getClassById = async (req, res) => {
    try {
        const singleClass = await classModel.findById({_id: req.params.id });
        console.log(singleClass);
        if (singleClass) {
            return res.status(200).send({
                message: "a",
                singleClass
            });
        } 
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// Edit class by ID
const editClassById = async (req, res) => {
    try {
        const singleClass = await classModel.findById(req.params.id);
        if (!singleClass) {
            res.status(404).send({ message: 'Class not found' });
            return;
        }else{
            // Update the fields of the retrieved class with the request body
            singleClass.status=req.body.status
            singleClass.no=req.body.no
            singleClass.title=req.body.title
            singleClass.date=req.body.date
            singleClass.day=req.body.day
            singleClass.time=req.body.time
            singleClass.contents=req.body.contents
            //save the updated details
            await singleClass.save()
            //respond with sucess message with updated class details
            res.status(200).send({
                message:"edited succesfully",
                singleClass
            });
        }
    } catch (err) {
        // Handle potential errors during the update or save operation
        res.status(500).json({ message: err.message });
    }
};

// Delete class by ID
const deleteClassById = async (req, res) => {
    try {
        const singleClass = await classModel.findByIdAndDelete(req.params.id);
        if (!singleClass) {
            res.status(404).send({ message: 'Class not found' });
            return;
        }else{

            //respond with sucess message with deleted class details
            res.status(200).send({
                message:"deleted succesfully",
                singleClass
            });
        }
    } catch (err) {
        // Handle potential errors during the update or save operation
        res.status(500).json({ message: err.message });
    }
};

export default {createClass,getAllClasses,getClassById,editClassById,deleteClassById}