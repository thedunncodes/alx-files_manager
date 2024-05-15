import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export class UsersController {
  static async postNew(req, res) {
    const data = req.body;
    if (!Object.keys(data).includes('email')) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!Object.keys(data).includes('password')) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const result = await dbClient.client.db().collection('users').findOne({ email: data.email });
    if (result) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    const hashedPwd = sha1(data.password);
    const newUser = await dbClient.client.db().collection('users').insertOne({ email: data.email, password: hashedPwd });
    res.status(201).json({ id: newUser.insertedId, email: data.email });
  }
}

export class UserController {
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token.toString()}`);
    if (userId === null || !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.client.db().collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user || user === null) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ id: user._id.toString(), email: user.email });
  }
}
