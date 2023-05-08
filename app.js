const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./src/db');

const app = express();

// Importing routes
const usersRouter = require('./src/router/usersRouter');
const rolesRouter = require('./src/router/rolesRouter');

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/users', usersRouter);
app.use('/roles', rolesRouter);

// Connect to the database and start the server
db.connect().then(() => {
  console.log('Connected to the database.');

  // Start the server
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
  });
}).catch((err) => {
  console.error(`Failed to connect to the database: ${err}`);
});


