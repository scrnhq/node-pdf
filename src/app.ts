import logger from 'morgan';
import * as Sentry from '@sentry/node';
import createError, { HttpError } from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';

import debug from './debug';
import pdfRouter from './routes/pdf';
import screenshotRouter from './routes/screenshot';

var app = express();

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

app.use(Sentry.Handlers.requestHandler());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/pdf', pdfRouter);
app.use('/screenshot', screenshotRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

app.use(Sentry.Handlers.errorHandler());

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  debug(err);
  res.status(err.status || 500).json(err);
});

export default app;
