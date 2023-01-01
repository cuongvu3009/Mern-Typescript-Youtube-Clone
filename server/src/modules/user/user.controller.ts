import { Request, Response, NextFunction } from 'express'
import { BadRequestError, ValidationRequestError } from '../../helpers/apiError'
import User from './user.model'
import UserService from './user.service'
import { body, validationResult } from 'express-validator'

// POST /signup
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const resultErrors = validationResult(req)
  if (!resultErrors.isEmpty()) {
    const errors = resultErrors.array({ onlyFirstError: true })
    const errorMessage = errors[0].param + ' ' + errors[0].msg
    next(new ValidationRequestError(errorMessage))
  }

  try {
    const { username, password } = req.body
    const user = new User({
      username,
      password,
    })

    const result = await UserService.signup(user)

    const oneDay = 1000 * 60 * 60 * 24

    res
      .cookie('access_token', result?.token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
        // signed: true,
      })
      .status(201)
      .json({ result })
  } catch (error) {
    if (error instanceof Error && error.name == 'ValidationError') {
      next(new BadRequestError('Invalid Request', error))
    } else {
      next(error)
    }
  }
}

// POST /login
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const resultErrors = validationResult(req)
    if (!resultErrors.isEmpty()) {
      const errors = resultErrors.array({ onlyFirstError: true })
      const errorMessage = errors[0].param + ' ' + errors[0].msg
      next(new ValidationRequestError(errorMessage))
    }

    const { username, password } = req.body

    const user = new User({
      username,
      password,
    })

    const result = await UserService.authenticate(user)

    const oneDay = 1000 * 60 * 60 * 24

    res
      .cookie('access_token', result?.token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
        // signed: true,
      })
      .status(200)
      .json({ result })
  } catch (error) {
    if (error instanceof Error && error.name == 'ValidationError') {
      next(new BadRequestError('Invalid Request', error))
    } else {
      next(error)
    }
  }
}

//	update user
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { username, password, role, profilePhoto } = req.body
    return res.json(
      await UserService.updateOne(id, {
        username,
        password,
        role,
        profilePhoto,
      })
    )
  } catch (error) {
    return next(error)
  }
}

//	delete user
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    return res.json(await UserService.deleteOne(id))
  } catch (error) {
    return next(error)
  }
}

//	get user
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    return res.json(await UserService.findOneById(id))
  } catch (error) {
    return next(error)
  }
}

//	get users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json(await UserService.getAllUsers())
  } catch (error) {
    return next(error)
  }
}

//	subscribe
export const subscribe = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id
    const subscribedUserId = req.params.id
    await UserService.subscribe(userId, subscribedUserId)

    return res.json({ message: 'Subscribed successfully!' })
  } catch (error) {
    return next(error)
  }
}

//	unsubscribe
export const unsubscribe = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id
    const subscribingUserId = req.params.id
    await UserService.unsubscribe(userId, subscribingUserId)

    return res.json({ message: 'Unsubscribed successfully!' })
  } catch (error) {
    return next(error)
  }
}

//	like
export const likeVideo = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id
    const videoId = req.params.videoId
    return res.json(await UserService.likeVideo(userId, videoId))
  } catch (error) {
    return next(error)
  }
}

//	dislike
export const dislikeVideo = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id
    const videoId = req.params.videoId
    return res.json(await UserService.dislikeVideo(userId, videoId))
  } catch (error) {
    return next(error)
  }
}
