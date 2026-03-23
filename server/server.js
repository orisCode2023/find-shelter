import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './src/db/mongo.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


await connectDB()



app.listen(PORT, () => {
    console.log('Server is running on port http://localhost:',PORT)
})