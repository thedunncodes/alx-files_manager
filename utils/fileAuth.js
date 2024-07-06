import { ObjectId } from 'mongodb';
import dbClient from './db';

export async function getFileById(id) {
  if (!id) {
    return null;
  }
  const file = await dbClient.client.db().collection('files').findOne({ _id: new ObjectId(id) });
  if (!file) {
    return null;
  }
  return file;
}

export async function getUserFilesWithId(Id) {
  if (!Id) {
    return null;
  }
  const userFiles = await dbClient.client.db().collection('files').find({ userId: new ObjectId(Id) }).toArray();
  if (!userFiles) {
    return null;
  }

  return userFiles;
}
