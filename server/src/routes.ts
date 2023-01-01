import express from 'express'
import {
  createUser,
  authenticate,
  subscribe,
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  unsubscribe,
  likeVideo,
  dislikeVideo,
} from './modules/user/user.controller'

import {
  getByTag,
  getVideo,
  addVideo,
  updateVideo,
  deleteVideo,
  addView,
  random,
  trend,
  sub,
  search,
  uploadVideo,
  uploadImg,
} from './modules/video/video.controller'
import { verifyAdmin, verifyToken, verifyUser } from './middlewares/verifyToken'

const router = express.Router()

//	Auth
router.post('/auth/signin', authenticate)
router.post('/auth/signup', createUser)

//	Users routes
router.put('/users/:id', verifyUser, updateUser)
router.delete('/users/:id', verifyUser, deleteUser)
router.get('/users/find/:id', getUserById)
router.get('/users/', verifyAdmin, getAllUsers)
router.patch('/users/sub/:id', verifyToken, subscribe)
router.patch('/users/unsub/:id', verifyToken, unsubscribe)
router.patch('/users/like/:videoId', verifyToken, likeVideo)
router.patch('/users/dislike/:videoId', verifyToken, dislikeVideo)

//	Videos routes
router.post('/videos/upload', verifyToken, uploadVideo)
router.post('/videos/uploadimg', verifyToken, uploadImg)
router.post('/videos/', verifyToken, addVideo)
router.put('/videos/:id', verifyToken, updateVideo)
router.delete('/videos/:id', verifyToken, deleteVideo)
router.get('/videos/find/:id', getVideo)
router.put('/videos/view/:id', addView)
router.get('/videos/trend', trend)
router.get('/videos/random', random)
router.get('/videos/sub', verifyToken, sub)
router.get('/videos/tags', getByTag)
router.get('/videos/search', search)

export default router
