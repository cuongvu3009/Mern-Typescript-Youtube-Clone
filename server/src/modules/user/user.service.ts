import jwtDecode from 'jwt-decode'
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../helpers/apiError'
import User, { UserDocument } from './user.model'
import {
  createToken,
  hashPassword,
  verifyPassword,
} from '../../util/authentication'

export type MyToken = {
  id: string
  username: string
  role: string
  iat: number
  exp: number
}

export type UserResponse = {
  message: string
  token: string
  expiresAt: number
  userInfo: UserDocument
}

// POST /signup
const signup = async (
  user: UserDocument
): Promise<UserResponse | undefined> => {
  const { username, password } = user
  const hashedPassword = await hashPassword(password)

  const userData = {
    username: username.toLowerCase(),
    password: hashedPassword,
  }

  const existingUsername = await User.findOne({
    username: userData.username,
  })

  if (existingUsername) {
    throw new BadRequestError('Username already exists.')
  }

  const newUser = new User(userData)
  const savedUser = await newUser.save()

  if (savedUser) {
    const token = createToken(savedUser)
    const decodedToken = jwtDecode<MyToken>(token)
    const expiresAt = decodedToken.exp

    return {
      message: 'User created!',
      token,
      userInfo: savedUser,
      expiresAt,
    }
  } else {
    throw new BadRequestError('There was a problem creating your account.')
  }
}

const authenticate = async (
  user: UserDocument
): Promise<UserResponse | undefined> => {
  const { username, password } = user

  const userData = await User.findOne({
    username: username.toLowerCase(),
  })

  if (!userData) {
    throw new ForbiddenError('Wrong username or password.')
  }

  const passwordValid = await verifyPassword(password, userData.password)

  if (passwordValid) {
    const token = createToken(userData)
    const decodedToken = jwtDecode<MyToken>(token)
    const expiresAt = decodedToken.exp

    return {
      message: 'Authentication successful!',
      token,
      userInfo: userData,
      expiresAt,
    }
  } else {
    throw new BadRequestError('Something went wrong.')
  }
}

const findOneById = async (id: string) => {
  const foundUser = await User.findById(id).select('-password')
  if (foundUser) {
    return foundUser
  } else {
    throw new NotFoundError()
  }
}

const getAllUsers = async () => {
  const foundUsers = await User.find({})
  if (foundUsers) {
    return foundUsers
  } else {
    throw new NotFoundError()
  }
}

const updateOne = async (id: string, update: Partial<UserDocument>) => {
  const foundUser = await User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).select('-password')
  if (foundUser) {
    return foundUser
  } else {
    throw new NotFoundError()
  }
}

const deleteOne = async (id: string) => {
  const foundUser = await User.findByIdAndDelete(id)
  if (foundUser) {
    return foundUser
  } else {
    throw new NotFoundError()
  }
}

const subscribe = async (userId: string, subscribedUserId: string) => {
  await User.findByIdAndUpdate(userId, {
    $addToSet: { subscribedUsers: subscribedUserId },
  })
  await User.findByIdAndUpdate(subscribedUserId, {
    $addToSet: { subscribers: userId },
  })
}

const unsubscribe = async (userId: string, subscribingUserId: string) => {
  await User.findByIdAndUpdate(userId, {
    $pull: { subscribedUsers: subscribingUserId },
  })
  await User.findByIdAndUpdate(subscribingUserId, {
    $pull: { subscribers: userId },
  })
}

const likeVideo = async (userId: string, videoId: string) => {
  // await Video.findByIdAndUpdate(videoId, {
  //   $addToSet: { likes: userId },
  //   $pull: { dislikes: userId },
  // });
}

const dislikeVideo = async (userId: string, videoId: string) => {
  // await Video.findByIdAndUpdate(videoId, {
  //   $addToSet: { dislikes: userId },
  //   $pull: { likes: userId },
  // });
}

export default {
  signup,
  authenticate,
  findOneById,
  getAllUsers,
  updateOne,
  deleteOne,
  unsubscribe,
  subscribe,
  likeVideo,
  dislikeVideo,
}
