import express, { Request, Response, NextFunction } from 'express';
import createError, { HttpError } from 'http-errors';
import logger from 'morgan';

import indexRouter from './routes';

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json(err);
});

export default app;
