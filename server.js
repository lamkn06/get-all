const path = require('path');
const compression = require('compression');

const express = require('express');
const app = express();
const dotenv = require('dotenv');
const apiMocker = require('connect-api-mocker');

const env = process.env.NODE_ENV;
const bodyParser = require('body-parser');
const cors = require('cors');

try {
  dotenv.config();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(require('cookie-parser')());
  app.use(cors());

  if (env === 'production') {
    const publicPath = '/';
    const outputPath = path.resolve(process.cwd(), 'build');

    app.use(compression());
    app.use(publicPath, express.static(outputPath));
    app.get('*', (req, res) =>
      res.sendFile(path.resolve(outputPath, 'index.html')),
    );
  } else {
    app.use('/api', apiMocker('src/mocks/api'));
  }

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, async () => {
    console.log(
      `Server listening on http://localhost:${PORT} in ${process.env.NODE_ENV}`,
    );
  });
} catch (e) {
  console.error(e);
}
