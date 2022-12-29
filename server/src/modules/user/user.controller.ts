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

export const validateUser = [
  body('username')
    .exists()
    .trim()
    .withMessage('is required')

    .notEmpty()
    .withMessage('cannot be blank')

    .isLength({ max: 16 })
    .withMessage('must be at most 16 characters long')

    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('contains invalid characters'),

  body('password')
    .exists()
    .trim()
    .withMessage('is required')

    .notEmpty()
    .withMessage('cannot be blank')

    .isLength({ min: 6 })
    .withMessage('must be at least 6 characters long')

    .isLength({ max: 50 })
    .withMessage('must be at most 50 characters long'),
]
