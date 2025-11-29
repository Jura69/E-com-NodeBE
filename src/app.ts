import 'dotenv/config';
import compression from 'compression';
import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

const app: Express = express();

// init middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  cors({
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
  })
);

// init db
import './dbs/init.mongodb';

// init redis
import { initRedis } from './dbs/init.redis';
// let redisClient: any = null;

// test
// const startRedisTests = () => {
//   require('./tests/inventory.test');
//   const productTest = require('./tests/product.test');
//   productTest.purchaseProduct('product:001', 10);
// };

// Khởi tạo Redis
initRedis()
  .then((_client: any) => {
    // redisClient = client;
    console.log('Redis initialized successfully!');
    // startRedisTests();
  })
  .catch((err: Error) => {
    console.error('Redis initialization error:', err);
  });

// init routes
import routes from './routes';
app.use('/', routes);

// handling errors
app.use((_req: Request, _res: Response, next: NextFunction) => {
  const error: any = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    stack: error.stack,
    message: error.message || 'Internal Server Error',
  });
});

export default app;

