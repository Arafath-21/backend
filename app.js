import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import AppRoutes from './src/routes/index.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/v1/student',AppRoutes)

let PORT = process.env.PORT || 3000

mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  }).catch((error) => console.log(`${error} DB did not connect`));