import { ObjectId } from 'mongodb';
import dbClient from './db';
import redisClient from './redis';

export async function getUserWithToken(req) {
  const token = req.headers['x-token'];
  if (!token) {
    return null;
  }
  const userId = await redisClient.get(`auth_${token}`);
  if (userId === null || !userId) {
    return null;
  }
  const user = await dbClient.client.db().collection('users').findOne({ _id: new ObjectId(userId) });
  if (!user || user === null) {
    return null;
  }

  return user;
}

export async function getFileWithParentId(pId) {
  if (!pId) {
    return null;
  }
  const userFile = await dbClient.client.db().collection('files').findOne({ _id: new ObjectId(pId) });
  if (!userFile) {
    return null;
  }

  return userFile;
}
