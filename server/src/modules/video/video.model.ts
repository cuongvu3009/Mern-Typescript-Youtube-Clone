import mongoose, { Document, ObjectId } from 'mongoose'

export interface VideoDocument extends Document {
  userId: ObjectId
  title: string
  desc: string
  imgUrl: string
  videoUrl: string
  views: number
  tags: string[]
  likes: ObjectId[]
  dislikes: ObjectId[]
}

const VideoSchema = new mongoose.Schema<VideoDocument>(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    likes: {
      type: [String],
      default: [],
    },
    dislikes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
)

const Video = mongoose.model('Video', VideoSchema)
export default Video
