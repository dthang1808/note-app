import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, maxlength: 120 },
    content: { type: String, maxlength: 20000, default: '' },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('Note', noteSchema);
