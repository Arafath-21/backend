// Importing necessary packages for setting up the Express server
import express from 'express'; // Importing Express.js framework
import dotenv from 'dotenv'; // Importing dotenv to manage environment variables
import cors from 'cors'; // Importing cors for enabling Cross-Origin Resource Sharing
import mongoose from 'mongoose'; // Importing mongoose for MongoDB database interaction
import AppRoutes from './src/routes/index.js'; // Importing routes from the index.js file in the routes directory

dotenv.config(); // Configuring dotenv to load environment variables from the .env file

const app = express(); // Initializing the Express application

// Middleware setup
app.use(cors()); // Enabling Cross-Origin Resource Sharing for all routes
app.use(express.json()); // Allowing Express to parse JSON bodies of incoming requests
app.use('/api/v1/student', AppRoutes); // Mounting the routes defined in AppRoutes under the '/api/v1/student' endpoint

let PORT = process.env.PORT || 3000; // Defining the port for the server to listen on, defaulting to 3000 if not specified in the environment variables

// Connecting to MongoDB database using the provided URI
mongoose.connect(process.env.MONGO_URI).then(() => {
  // Starting the Express server if the database connection is successful
  app.listen(PORT, () => console.log(`Server Port: ${PORT}, DB connected Succesfully`));
}).catch((error) => {
  // Handling errors if the database connection fails
  console.log(`DB did not connect ${error}`);
});
