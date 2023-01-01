import { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import * as cloudinary from 'cloudinary'

import { BadRequestError, UnauthorizedError } from '../../helpers/apiError'
import Video from './video.model'
import User from '../user/user.model'

export const uploadVideo = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // const result = await cloudinary.v2.uploader.upload(
    //   req.files.video.tempFilePath,
    //   {
    //     use_filename: true,
    //     folder: 'mern-social/video',
    //     resource_type: 'video',
    //   }
    // )
    // fs.unlinkSync(req.files.video.tempFilePath)
    // res.status(200).json({ videoSrc: result.secure_url })
    const video = new Video(req.body.video)
    const savedVideo = video.save()
    res.status(200).json(savedVideo)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const uploadImg = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await cloudinary.v2.uploader.upload(
      req.files.image.tempFilePath,
      { use_filename: true, folder: 'mern-social/img' }
    )
    fs.unlinkSync(req.files.image.tempFilePath)
    res.status(200).json({ imgSrc: result.secure_url })
  } catch (error) {
    next(error)
  }
}

export const addVideo = async (req: any, res: Response, next: NextFunction) => {
  const newVideo = new Video({ userId: req.user.id, ...req.body })
  try {
    const savedVideo = await newVideo.save()
    res.status(200).json(savedVideo)
  } catch (err) {
    next(err)
  }
}

export const updateVideo = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const video = await Video.findById(req.params.id)
  if (!video) {
    return next(new BadRequestError('No video with that id found!'))
  }
  if (req.user.id === video.userId) {
    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
    res.status(200).json(updatedVideo)
  } else {
    return next(new UnauthorizedError('You are not allow to do that!'))
  }
}

export const deleteVideo = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const video = await Video.findById(req.params.id)
  if (!video) return next(new BadRequestError('No video with that id found!'))
  if (req.user.id === video.userId) {
    const deletedVideo = await Video.findByIdAndDelete(req.params.id)
    res.status(200).json(deletedVideo)
  } else {
    return next(new UnauthorizedError('You are not allow to do that!'))
  }
}

export const getVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const video = await Video.findById(req.params.id)
  res.status(200).json(video)
}

export const addView = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const video = await Video.findById(req.params.id)
  if (!video) return next(new BadRequestError('No video with that id found!'))
  await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
  res.send('addView')
}

export const random = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const videos = await Video.find()
  res.status(200).json(videos)
}

export const trend = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //	If views: 1 (then it will return lowest views videos), if view: -1 then it will return highest views videos
  const trendVideos = await Video.find().sort({ views: -1 })
  res.status(200).json(trendVideos)
}

export const sub = async (req: any, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user.id)
  const subcribedChannels = await user!.subscribedUsers

  const list = await Promise.all(
    subcribedChannels.map((channelId) => {
      return Video.find({ userId: channelId })
    })
  )
  //	add .flat() to remove 1 layer array bracket
  res.status(200).json(list.flat())
}

export const getByTag = async (req: any, res: Response, next: NextFunction) => {
  const tags = req.query.tags.split(',')
  //loop inside tags, and search inside ($in) of tags to see if tags exist
  const videos = await Video.find({ tags: { $in: tags } })
  res.status(200).json(videos)
}

export const search = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = req.query.query
  const videos = await Video.find({
    title: { $regex: query, $options: 'i' },
  })
  res.status(200).json(videos)
}

module.exports = {
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
}
