import express, { Request, Response } from 'express';
import app from '../server/index.js';
import apiRouter from '../server/routes/index.js';

const vercelApp = express();

// Handle standard API paths
vercelApp.use('/api/v1', apiRouter);
vercelApp.use('/api', apiRouter);

// Fallback to full express app
vercelApp.use('/', app);

export default vercelApp;
