import express from 'express';
import cors from 'cors';
import { signUp, signIn } from './controllers/clients.js';
import { getPlans } from './controllers/plans.js';
import { verifyToken } from './middlewares.js';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/sign-up', signUp);
app.post('/sign-in', signIn);

app.get('/plans', verifyToken, getPlans);

export default app;
