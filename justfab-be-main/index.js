require('dotenv').config({ path: `${process.env.NODE_ENV}.env` });
const _ = require('lodash');
const express = require('express');
const { connectMongoDB } = require('./config/mongodb.config')

const app = express();

// Monitor event loop delay
const { monitorEventLoopDelay } = require('perf_hooks');
const h = monitorEventLoopDelay();
h.enable();

setInterval(() => {
  console.log('[Event Loop Delay]');
  console.log('Mean delay:', (h.mean / 1e6).toFixed(2), 'ms');
  console.log('Max delay:', (h.max / 1e6).toFixed(2), 'ms');
}, 5000);

const bodyParser = require('body-parser');
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  const start = process.hrtime.bigint(); // High-resolution start time

  res.on('finish', () => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;
      const color = durationMs > 500 ? '\x1b[31m' : '\x1b[32m';
      console.log(`${color}[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${durationMs.toFixed(2)} ms\x1b[0m`);
  });

  next();
});
app.get('/', (req, res) => {
    res.send('Hello, Docker with PM2!');
});

const telegramRoute = require('./routes/telegram.route')
const { setupWebhook } = require('./services/telegram.service')
app.use('/telegram', telegramRoute);

const userRoute = require('./routes/user.route')
app.use('/user', userRoute);

const itemRoute = require('./routes/item.route')
app.use('/item', itemRoute);

const assetRoute = require('./routes/asset.route')
app.use('/asset', assetRoute);
app.use('/uploads', express.static('uploads'));

const inventoryRoute = require('./routes/inventory.route')
app.use('/inventory', inventoryRoute);

const slotMachineRoute = require('./routes/slotMachine.route')
app.use('/slotMachine', slotMachineRoute)

const jackpot = require('./routes/jackpot.route');
app.use('/jackpot', jackpot)

const skill = require('./routes/skill.route');
app.use('/skill', skill);

const reward = require('./routes/reward.route');
app.use('/reward', reward);

const referral = require('./routes/referral.route');
app.use('/referral', referral);
require("./envents/referral.listener");

const task = require('./routes/task.route');
app.use('/task', task);
require("./envents/task.listener");

const taskGroup = require('./routes/taskGroup.route');
app.use('/taskGroup', taskGroup);

const userKapy = require('./routes/userKapy.route');
app.use('/kapy', userKapy);

const darkTool = require('./routes/darkTool.route');
app.use('/darkTool', darkTool);

const swaggerUi = require('swagger-ui-express');
const jsDoc = require('./swagger');
const YAML = require('yamljs');
const yamlDoc = YAML.load('./swagger.yml');
const swaggerDocument = _.merge({}, yamlDoc, jsDoc);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
    throw { message: `Route ${req.originalUrl} not found` };
});

const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV}`);
    connectMongoDB();
    setupWebhook();
});