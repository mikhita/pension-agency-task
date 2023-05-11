const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./src/db');
const routes = require('./src/router/usersRouter');

const app = express();

app.use(bodyParser.json());

app.use('/', routes);


app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
