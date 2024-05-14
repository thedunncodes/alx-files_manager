import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = Router();

router.get('/status', AppController.getStatus);

router.get('/stats', AppController.getStat);

router.post('/users', UsersController.postNew);

module.exports = router;
