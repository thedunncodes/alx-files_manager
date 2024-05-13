import { Router } from 'express';
import {
  getStatus, getStat, getHome, getJack,
} from '../controllers/AppController';

const router = Router();

router.get('/status', getStatus);

router.get('/stats', getStat);

router.get('/', getHome);

router.get('/j', getJack);

module.exports = router;
