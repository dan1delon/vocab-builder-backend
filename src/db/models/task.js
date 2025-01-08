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
    taskType: {
      type: String,
      enum: ['en', 'ua'],
      required: true,
    },
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false, timestamps: true },
);

export const TasksCollection = model('tasks', taskSchema);
