import { UserDocument } from '../modules/user/user.model'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { JWT_SECRET } from './secrets'

export const createToken = (user: UserDocument) => {
  // Sign the JWT
  if (!user.role) {
    throw new Error('No user role specified')
  }

  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '7d' }
  )
}

export const isTokenValid = ({ token }: any) => jwt.verify(token, JWT_SECRET)

export const hashPassword = (password: string) => {
  return new Promise((resolve, reject) => {
    // Generate a salt at level 12 strength
    bcrypt.genSalt(12, (err: any, salt: string) => {
      if (err) {
        reject(err)
      }
      bcrypt.hash(password, salt, (err: any, hash: string) => {
        if (err) {
          reject(err)
        }
        resolve(hash)
      })
    })
  })
}

export const verifyPassword = (
  candidatePassword: string,
  hashedPassword: string
) => {
  return bcrypt.compare(candidatePassword, hashedPassword)
}
