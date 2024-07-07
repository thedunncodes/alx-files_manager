import { ObjectId } from 'mongodb';
import dbClient from './db';
import { stringify } from 'uuid';

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

export async function getUserFilesWithId(Id, page) {
  if (!Id) {
    return null;
  }
  const userFiles = await dbClient.client.db().collection('files').aggregate([
    { $match: { userId: new ObjectId(Id) } },
    { $skip: Number(page) * 20 },
    { $limit: 20 },
  ]).toArray();
  if (!userFiles) {
    return null;
  }

  return userFiles;
}

export async function getUserFilesWithParentId(Id, page) {
  if (!Id) {
    return [];
  }
  const userFiles = await dbClient.client.db().collection('files').aggregate([
    { $match: { parentId: String(Id) } },
    { $skip: Number(page) * 20 },
    { $limit: 20 },
  ]).toArray();
  if (!userFiles) {
    return [];
  }

  return userFiles;
}
