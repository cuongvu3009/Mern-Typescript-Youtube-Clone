import express from 'express'
import lusca from 'lusca'
import dotenv from 'dotenv'
import compression from 'compression'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cloudinary from 'cloudinary'

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SEC,
})

import routers from './routes'

import apiErrorHandler from './middlewares/apiErrorHandler'
import apiContentType from './middlewares/apiContentType'

const corsOptions = {
  origin: '*',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}

dotenv.config({ path: '.env' })
const app = express()

app.use(cors(corsOptions))

// Express configuration
app.set('port', process.env.PORT || 1234)
// app.use(apiContentType)

// Use common 3rd-party middlewares
app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())
app.use(compression())
app.use(morgan('tiny'))
app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))

// Use general router
app.get('/', (req, res) => {
  res.send('hello world')
})
app.use('/api/v1', routers)

// Custom API error handler
app.use(apiErrorHandler)

export default app
