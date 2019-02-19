import express, { Request, Response, NextFunction } from 'express';
import createError, { HttpError } from 'http-errors';
import logger from 'morgan';

import debug from './debug';
import pdfRouter from './routes/pdf';
import screenshotRouter from './routes/screenshot';

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/pdf', pdfRouter);
app.use('/screenshot', screenshotRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  debug(err);
  res.status(err.status || 500).json(err);
});

export default app;
