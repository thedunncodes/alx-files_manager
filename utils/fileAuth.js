import { ObjectId } from 'mongodb';
import dbClient from './db';

export default async function getFileById(id) {
  if (!id) {
    return null;
  }
  const file = await dbClient.client.db().collection('files').findOne({ _id: new ObjectId(id) });
  if (!file) {
    return null;
  }
  return file;
}
