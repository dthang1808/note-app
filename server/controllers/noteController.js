import mongoose from 'mongoose';
import Note from '../models/Note.js';

function serializeNote(note) {
  return {
    id: note._id.toString(),
    title: note.title,
    content: note.content,
    pinned: note.pinned,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

function validateNote(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';

  if (!title && !content) {
    return { error: 'Hãy nhập tiêu đề hoặc nội dung ghi chú.' };
  }

  if (title.length > 120) {
    return { error: 'Tiêu đề không được vượt quá 120 ký tự.' };
  }

  if (content.length > 20000) {
    return { error: 'Nội dung không được vượt quá 20.000 ký tự.' };
  }

  return {
    value: {
      title: title || 'Ghi chú mới',
      content,
      pinned: Boolean(body.pinned),
    },
  };
}

export async function getNotes(req, res, next) {
  try {
    const notes = await Note.find().sort({ pinned: -1, updatedAt: -1 }).lean();
    res.json(notes.map(serializeNote));
  } catch (error) {
    next(error);
  }
}

export async function createNote(req, res, next) {
  try {
    const result = validateNote(req.body ?? {});
    if (result.error) return res.status(400).json({ error: result.error });

    const note = await Note.create(result.value);
    res.status(201).json(serializeNote(note));
  } catch (error) {
    next(error);
  }
}

export async function updateNote(req, res, next) {
  try {
    const result = validateNote(req.body ?? {});
    if (result.error) return res.status(400).json({ error: result.error });

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Không tìm thấy ghi chú.' });
    }

    const note = await Note.findByIdAndUpdate(req.params.id, result.value, {
      new: true,
      runValidators: true,
    }).lean();
    if (!note) return res.status(404).json({ error: 'Không tìm thấy ghi chú.' });

    res.json(serializeNote(note));
  } catch (error) {
    next(error);
  }
}

export async function deleteNote(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ error: 'Không tìm thấy ghi chú.' });
    }

    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: 'Không tìm thấy ghi chú.' });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
