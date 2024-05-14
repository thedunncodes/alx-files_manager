import sha1 from 'sha1';
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
