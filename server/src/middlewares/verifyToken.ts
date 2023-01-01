import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import { UnauthorizedError, InvalidToken } from '../helpers/apiError'
import { JWT_SECRET } from '../util/secrets'
import { ADMIN } from '../modules/user/user.model'

// This verifies that is the token correct i.e. weather person is admin or not
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token
  if (!token) {
    throw new InvalidToken()
  }

  const user = jwt.verify(token, JWT_SECRET) as any
  req.user = user
  return next()
}

const verifyUser = (req: any, res: Response, next: NextFunction) => {
  verifyToken(req, res, () => {
    if (req.user?.id === req.params.id || req.user?.role === ADMIN) {
      next()
    } else {
      return next(new UnauthorizedError())
    }
  })
}

const verifyAdmin = async (req: any, res: Response, next: NextFunction) => {
  verifyUser(req, res, () => {
    if (req.user?.role === ADMIN) {
      next()
    } else {
      return next(
        new UnauthorizedError('Only admin is allowed for this request')
      )
    }
  })
}

export { verifyAdmin, verifyToken, verifyUser }
