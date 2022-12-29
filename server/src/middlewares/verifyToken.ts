import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import ApiError, { UnauthorizedError, InvalidToken } from '../helpers/apiError'
import { JWT_SECRET } from '../util/secrets'
import userService from '../modules/user/user.service'
import { ADMIN } from '../modules/user/user.model'

// This verifies that is the token correct i.e. weather person is admin or not
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token
  if (!token) {
    throw new UnauthorizedError()
  }

  try {
    const { userId } = jwt.verify(token, JWT_SECRET) as any
    req.user = await userService.findOneById(userId)
    return next()
  } catch (e) {
    if (e instanceof ApiError) {
      return next(e)
    }
    return next(new InvalidToken())
  }
}

const verifyUser = (req: any, res: Response, next: NextFunction) => {
  try {
    verifyToken(req, res, () => {
      if (req.user?.id === req.params.id || req.user?.role === ADMIN) {
        next()
      } else {
        throw new UnauthorizedError()
      }
    })
  } catch (e) {
    return next(e)
  }
}

const verifyAdmin = (req: any, res: Response, next: NextFunction) => {
  try {
    verifyToken(req, res, () => {
      if (req.user.isAdmin) {
        next()
      } else {
        throw new UnauthorizedError()
      }
    })
  } catch (e) {
    return next(e)
  }
}

module.exports = { verifyAdmin, verifyToken, verifyUser }
