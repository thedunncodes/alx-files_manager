import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getUserWithToken, getFileWithParentId } from '../utils/getUser';
import getFileById from '../utils/fileAuth';
import dbClient from '../utils/db';

export default class FilesController {
  static async postUpload(req, res) {
    const user = await getUserWithToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileTypes = ['folder', 'file', 'image'];
    if (!req.body.name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!fileTypes.includes(req.body.type) || !req.body.type) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!req.body.data && (req.body.type !== 'folder')) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (req.body.parentId) {
      const userFile = await getFileWithParentId(req.body.parentId);
      if (!userFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (userFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileUuid = uuidv4();
    let directoryPath = process.env.FOLDER_PATH || '/tmp/files_manager/';
    if (directoryPath.endsWith('/')) {
      directoryPath = directoryPath.slice(0, -1);
    }
    fs.mkdirSync(directoryPath, { recursive: true });
    const filePath = `${directoryPath}/${fileUuid}`;

    const isPublic = req.body.isPublic || false;
    const parentId = req.body.parentId || 0;

    if (req.body.type === 'folder') {
      const newFile = await dbClient.client.db().collection('files').insertOne({
        userId: user._id,
        name: req.body.name,
        type: req.body.type,
        parentId,
      });

      const file = await getFileById(newFile.insertedId);
      return res.status(201).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        parentId: file.parentId,
      });
    }

    const newFile = await dbClient.client.db().collection('files').insertOne({
      userId: user._id,
      name: req.body.name,
      type: req.body.type,
      isPublic,
      parentId,
      localPath: filePath,
    });

    const file = await getFileById(newFile.insertedId);

    if (req.body.data) {
      const data = Buffer.from(req.body.data, 'base64').toString();
      fs.writeFile(filePath, data, (err) => {
        if (err) {
          console.error(`File Error: \n${err}`);
        }
      });
    }

    return res.status(201).json({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getShow(req, res) {
    const user = await dbClient.client.collection('users').findOne({ _id: req.params.id })
  }
}
