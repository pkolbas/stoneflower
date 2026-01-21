import { Router } from 'express';
import type { Request, Response } from 'express';
import { getAllSpecies, getSpeciesById, searchSpecies } from '../services/speciesService.js';

const router = Router();

// Get all species
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const species = await getAllSpecies();
    res.json({ species });
  } catch (error) {
    console.error('Error getting species:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search species
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      res.status(400).json({ error: 'Query must be at least 2 characters' });
      return;
    }

    const species = await searchSpecies(query);
    res.json({ species });
  } catch (error) {
    console.error('Error searching species:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single species
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const species = await getSpeciesById(req.params.id);

    if (!species) {
      res.status(404).json({ error: 'Species not found' });
      return;
    }

    res.json({ species });
  } catch (error) {
    console.error('Error getting species:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
