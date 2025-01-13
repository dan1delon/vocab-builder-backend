import { model, Schema } from 'mongoose';

const taskSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    wordId: {
      type: Schema.Types.ObjectId,
      ref: 'words',
      required: true,
    },
    task: {
      type: String,
      enum: ['en', 'ua'],
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const TasksCollection = model('tasks', taskSchema);
