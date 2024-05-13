import express from 'express';

const app = express();
const routes = require('./routes/index');

app.use(express.json());

app.use(routes);

const port = process.env.FOO || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
