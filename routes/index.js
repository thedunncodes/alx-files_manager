import { Router } from 'express';
import {
  getStatus, getStat,
} from '../controllers/AppController';

const router = Router();

router.get('/status', getStatus);

router.get('/stats', getStat);

module.exports = router;
