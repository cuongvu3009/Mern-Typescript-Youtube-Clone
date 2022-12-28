import express from 'express'
import { createUser, authenticate } from './modules/user/user.controller'

const router = express.Router()

//	Auth
router.post('/auth/signin', authenticate)
router.post('/auth/signup', createUser)

export default router
