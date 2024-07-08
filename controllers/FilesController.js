import fs from 'fs';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { getUserWithToken } from '../utils/getUser';
import { getFileById, getUserFilesWithId, getUserFilesWithParentId } from '../utils/fileAuth';
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
      const userFile = await getFileById(req.body.parentId);
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
    const parentId = new ObjectId(req.query.parentId) || String(0);

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
        isPublic,
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
    const user = await getUserWithToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await getFileById(req.params.id);

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!(file.userId.toString() === user._id.toString())) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json({
      id: file._id.toString(),
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getIndex(req, res) {
    const user = await getUserWithToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userFiles = [];
    let Files;
    const page = parseInt(req.query.page, 10) || 0;
    if (req.query.parentId) {
      const pID = new ObjectId(req.query.parentId) || String(0);
      Files = await getUserFilesWithParentId(pID, page);
    } else {
      Files = await getUserFilesWithId(user._id.toString(), page);
    }
    Files.forEach((item) => {
      userFiles.push({
        id: item._id.toString(),
        userId: item.userId,
        name: item.name,
        type: item.type,
        isPublic: item.isPublic,
        parentId: item.parentId,
      });
    });

    return res.status(200).json(userFiles);
  }
}
