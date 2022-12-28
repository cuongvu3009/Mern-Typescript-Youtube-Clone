/* eslint-disable @typescript-eslint/member-delimiter-style */
import mongoose, { Document } from 'mongoose'

export type User = {
  _id: mongoose.Types.ObjectId
  username: string
}

export const ADMIN = 'admin'
export const USER = 'user'
export type UserRole = typeof ADMIN | typeof USER

export type UserDocument = Document & {
  _id: mongoose.Types.ObjectId
  username: string
  password: string
  role: UserRole
  profilePhoto: string
  created: Date
  subscribers: [User]
  subscribedUsers: [User]
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: [ADMIN, USER], required: true, default: USER },
    profilePhoto: {
      type: String,
    },
    subscribers: {
      type: [String],
    },
    subscribedUsers: {
      type: [String],
    },
    created: { type: Date, default: Date.now },
  },
  {
    toObject: {
      transform: function (doc, ret) {
        delete ret._v
        delete ret.password
        return ret
      },
    },
    toJSON: {
      transform: function (doc, ret) {
        delete ret._v
        delete ret.password
        return ret
      },
    },
  }
)

export default mongoose.model<UserDocument>('User', userSchema)
