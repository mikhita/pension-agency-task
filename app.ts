import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './src/db';
import userRouter from './src/router/usersRouter';
require('ts-node').register();


const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use('/', userRouter);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
