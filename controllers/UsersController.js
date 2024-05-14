import crypto from 'crypto';
import dbClient from '../utils/db';

export default class UsersController {
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
    const result = await dbClient.client.db().collection('users').find({ email: data.email }).toArray();
    if (result.length > 0) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    const hashedPwd = crypto.createHash('sha1').update(data.password).digest('hex');
    const newUser = await dbClient.client.db().collection('users').insertOne({ email: data.email, password: hashedPwd });
    res.status(200).json({ id: newUser.insertedId, email: data.email });
  }
}
