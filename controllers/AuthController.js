import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(req, res) {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const auth = req.headers.authorization;
    const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
    const delimiterIndex = decoded.indexOf(':');

    const userEmail = decoded.slice(0, delimiterIndex);
    const userPassword = decoded.slice(delimiterIndex + 1);
    const result = await dbClient.client.db().collection('users').findOne({ email: userEmail });
    const hashedPwd = sha1(userPassword);
    if (!((hashedPwd === result.password) && (userEmail === result.email))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const uuidToken = uuidv4();
    await redisClient.set(`auth_${uuidToken}`, result._id.toString(), 86400);
    return res.status(200).json({ token: uuidToken });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token.toString()}`);
    if (userId === null || !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.client.db().collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user || user === null) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(`auth_${token.toString()}`);
    return res.status(204).send();
  }
}
