import { Router } from 'express';
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from '../controllers/noteController.js';
import requireAuth from '../middleware/requireAuth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
