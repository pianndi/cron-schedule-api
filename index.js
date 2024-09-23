import express from 'express';
import bodyParser from 'body-parser';
import formData from 'express-form-data';
import cors from 'cors';
import 'dotenv/config';
import cronRoutes from './routes/cron.route.js';
import cronController from './controllers/cron.controller.js';
import split from './utils/routes.js';
import miscRoutes from './routes/misc.route.js';
import cookieParser from "cookie-parser";
import { exec } from 'child_process';

let availableRoutes = [];
cronController.invokeCrons();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.use(formData.parse());
app.use((req, res, next) => {
  const PHPSESSID= req.cookies["PHPSESSID"];
  if (!PHPSESSID) return res.status(401).json({ message: "Unauthorized" })
  // run auth.php to check if the user is authenticated
  // if not, return res.status(401).json({ message: 'Unauthorized' });
  // get phpsessid from req.headers.cookie
  exec("php /var/www/auth.php "+PHPSESSID, (err, stdout, stderr) => {
    if (stdout == 200) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" })
    }

  });
})
app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Welcome to the Scheduler API!', data: availableRoutes });
});
app.use('/cron', cronRoutes);
app.use('/misc', miscRoutes);


app._router.stack.forEach(layer => {
  if (layer.route) {
    for (const method in layer.route.methods) {
      availableRoutes.push(`${method.toUpperCase()} ${layer.route.path}`);
    }
  } else if (layer.name === 'router') {
    layer.handle.stack.forEach(l => {
      if (l.route) {
        for (const method in l.route.methods) {
          availableRoutes.push(`${method.toUpperCase()} /${(split(layer.regexp).filter(Boolean).join('/')) + l.route.path}`);
        }
      }
    })
  }
})

app.all('*', (req, res) => {
  return res.status(404).json({ message: 'Route not found', data: availableRoutes });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)
