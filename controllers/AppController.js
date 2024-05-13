import dbClient from '../utils/db';
import redisClient from '../utils/redis';

exports.getStatus = (req, res) => {
  if (dbClient.isAlive() && redisClient.isAlive()) {
    res.status(200).json({ redis: true, db: true });
  }
};

exports.getStat = (req, res) => {
  Promise.all([dbClient.nbUsers(), dbClient.nbFiles()])
    .then(([noUsers, noFiles]) => {
      res.status(200).json({ users: noUsers, files: noFiles });
    });
};
