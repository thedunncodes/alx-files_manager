import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(req, res) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
    const delimiterIndex = decoded.indexOf(':');

    const userEmail = decoded.slice(0, delimiterIndex);
    const userPassword = decoded.slice(delimiterIndex + 1);
    const user = await dbClient.client.db().collection('users').findOne({ email: userEmail, password: sha1(userPassword) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const uuidToken = uuidv4();
    await redisClient.set(`auth_${uuidToken}`, user._id.toString(), 24 * 60 * 60);
    return res.status(200).json({ token: uuidToken });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (userId === null || !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.client.db().collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user || user === null) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}
