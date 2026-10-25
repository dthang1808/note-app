import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT) || 3001;
const directory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(directory, 'data');
const notesFile = path.join(dataDirectory, 'notes.json');

app.use(cors());
app.use(express.json({ limit: '32kb' }));

async function readNotes() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    return JSON.parse(await readFile(notesFile, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeFile(notesFile, '[]\n', 'utf8');
      return [];
    }

    throw error;
  }
}

async function saveNotes(notes) {
  await writeFile(notesFile, `${JSON.stringify(notes, null, 2)}\n`, 'utf8');
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

app.get('/api/notes', async (req, res, next) => {
  try {
    const notes = await readNotes();
    notes.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

app.post('/api/notes', async (req, res, next) => {
  try {
    const result = validateNote(req.body ?? {});
    if (result.error) return res.status(400).json({ error: result.error });

    const now = new Date().toISOString();
    const note = { id: randomUUID(), ...result.value, createdAt: now, updatedAt: now };
    const notes = await readNotes();
    notes.push(note);
    await saveNotes(notes);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

app.put('/api/notes/:id', async (req, res, next) => {
  try {
    const result = validateNote(req.body ?? {});
    if (result.error) return res.status(400).json({ error: result.error });

    const notes = await readNotes();
    const index = notes.findIndex((note) => note.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Không tìm thấy ghi chú.' });

    const note = { ...notes[index], ...result.value, updatedAt: new Date().toISOString() };
    notes[index] = note;
    await saveNotes(notes);
    res.json(note);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    const notes = await readNotes();
    const remaining = notes.filter((note) => note.id !== req.params.id);
    if (remaining.length === notes.length) {
      return res.status(404).json({ error: 'Không tìm thấy ghi chú.' });
    }

    await saveNotes(remaining);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại.' });
});

app.listen(port, () => {
  console.log(`Notes API đang chạy tại http://localhost:${port}`);
});
