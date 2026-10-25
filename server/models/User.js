import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
      match: /^[a-zA-Z0-9_.-]+$/,
    },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
