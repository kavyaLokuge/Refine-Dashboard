import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './mongodb/connect.js';
import userRouter from './routes/user.routes.js';
import propertyRouter from './routes/property.routes.js';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
const __dirname = dirname(fileURLToPath(import.meta.url));



dotenv.config();

const app = express();

app.use(cors());

// const apiProxy = createProxyMiddleware('api', { target: 'http://localhost:3000' });

app.use(express.json({ limit: '50mb' }));

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
// app.use('/api/*', apiProxy);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/properties', propertyRouter);


const startServer = async () => {
    try {
        connectDB(process.env.MONGODB_URL)
        app.listen(3000, () => console.log('Server started on port http://localhost:3000'));

    } catch (error) {
        console.log(error)
    }
}

startServer();
