import { Router } from 'express';
import AppController from '../controllers/AppController';
import { UsersController, UserController } from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = Router();

router.get('/status', AppController.getStatus);

router.get('/stats', AppController.getStat);

router.post('/users', UsersController.postNew);

router.get('/connect', AuthController.getConnect);

router.get('/disconnect', AuthController.getDisconnect);

router.get('/users/me', UserController.getMe);

router.post('/files', FilesController.postUpload);

module.exports = router;
