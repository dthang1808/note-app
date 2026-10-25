import cors from 'cors';
import express from 'express';
import { readFile } from 'node:fs/promises';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './middleware/logger.js';
import Note from './models/Note.js';
import notesRouter from './routes/notes.js';

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(logger);
app.use(cors());
app.use(express.json({ limit: '32kb' }));
app.use('/api/notes', notesRouter);
app.use(errorHandler);

async function migrateLegacyNotes() {
  let legacyNotes;

  try {
    legacyNotes = JSON.parse(
      await readFile(new URL('./data/notes.json', import.meta.url), 'utf8'),
    );
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }

  if (!Array.isArray(legacyNotes)) {
    throw new Error('Legacy notes file must contain a JSON array.');
  }

  if (legacyNotes.length === 0) return;

  if (await Note.exists()) {
    console.warn(
      `Found ${legacyNotes.length} legacy note(s), but MongoDB already contains notes. Skipping automatic import to avoid duplicates.`,
    );
    return;
  }

  await Note.insertMany(
    legacyNotes.map((note) => ({
      title: note.title,
      content: note.content,
      pinned: note.pinned,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    })),
  );
  console.log(`Imported ${legacyNotes.length} legacy note(s) to MongoDB.`);
}

async function startServer() {
  await connectDB();
  await migrateLegacyNotes();
  app.listen(port, () => {
    console.log(`Notes API đang chạy tại http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error(
    'MongoDB startup failed. Check MONGODB_URI, Atlas network access, and legacy note data.',
    error,
  );
  process.exit(1);
});
