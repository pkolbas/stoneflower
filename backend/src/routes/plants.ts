import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  createPlant,
  getPlantById,
  getUserPlants,
  updatePlant,
  deletePlant,
  archivePlant,
  recordCareAction,
  getPlantCareHistory,
  getPlantMessages,
  markMessagesAsRead,
  getPlantsNeedingWater,
} from '../services/plantService.js';
import type { CreatePlantDto, UpdatePlantDto, CareActionDto } from '../types/index.js';

const router = Router();

// Get all plants for current user
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const includeArchived = req.query.includeArchived === 'true';
    const plants = await getUserPlants(req.user.id, includeArchived);

    res.json({ plants });
  } catch (error) {
    console.error('Error getting plants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get plants needing water
router.get('/needing-water', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const plants = await getPlantsNeedingWater(req.user.id);
    res.json({ plants });
  } catch (error) {
    console.error('Error getting plants needing water:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single plant
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const plant = await getPlantById(req.params.id);

    if (!plant) {
      res.status(404).json({ error: 'Plant not found' });
      return;
    }

    if (plant.userId !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json({ plant });
  } catch (error) {
    console.error('Error getting plant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create plant
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data: CreatePlantDto = req.body;

    if (!data.nickname) {
      res.status(400).json({ error: 'Nickname is required' });
      return;
    }

    const plant = await createPlant(req.user.id, data);
    res.status(201).json({ plant });
  } catch (error) {
    console.error('Error creating plant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update plant
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingPlant = await getPlantById(req.params.id);

    if (!existingPlant) {
      res.status(404).json({ error: 'Plant not found' });
      return;
    }

    if (existingPlant.userId !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const data: UpdatePlantDto = req.body;
    const plant = await updatePlant(req.params.id, data);

    res.json({ plant });
  } catch (error) {
    console.error('Error updating plant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete plant
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingPlant = await getPlantById(req.params.id);

    if (!existingPlant) {
      res.status(404).json({ error: 'Plant not found' });
      return;
    }

    if (existingPlant.userId !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await deletePlant(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting plant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Archive plant
router.post('/:id/archive', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingPlant = await getPlantById(req.params.id);

    if (!existingPlant) {
      res.status(404).json({ error: 'Plant not found' });
      return;
    }

    if (existingPlant.userId !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const plant = await archivePlant(req.params.id);
    res.json({ plant });
  } catch (error) {
    console.error('Error archiving plant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Record care action (water, fertilize, etc.)
router.post('/:id/care', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingPlant = await getPlantById(req.params.id);

    if (!existingPlant) {
      res.status(404).json({ error: 'Plant not found' });
      return;
    }

    if (existingPlant.userId !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const data: CareActionDto = req.body;

    if (!data.actionType) {
      res.status(400).json({ error: 'Action type is required' });
      return;
    }

    const action = await recordCareAction(req.params.id, req.user.id, data);
    res.status(201).json({ action });
  } catch (error) {
    console.error('Error recording care action:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get care history
router.get('/:id/care', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingPlant = await getPlantById(req.params.id);

    if (!existingPlant) {
      res.status(404).json({ error: 'Plant not found' });
      return;
    }

    if (existingPlant.userId !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const limit = parseInt(req.query.limit as string, 10) || 50;
    const history = await getPlantCareHistory(req.params.id, limit);

    res.json({ history });
  } catch (error) {
    console.error('Error getting care history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get plant messages
router.get('/:id/messages', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingPlant = await getPlantById(req.params.id);

    if (!existingPlant) {
      res.status(404).json({ error: 'Plant not found' });
      return;
    }

    if (existingPlant.userId !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const limit = parseInt(req.query.limit as string, 10) || 50;
    const messages = await getPlantMessages(req.params.id, limit);

    res.json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark messages as read
router.post('/:id/messages/read', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingPlant = await getPlantById(req.params.id);

    if (!existingPlant) {
      res.status(404).json({ error: 'Plant not found' });
      return;
    }

    if (existingPlant.userId !== req.user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await markMessagesAsRead(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
