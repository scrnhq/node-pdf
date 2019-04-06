import express, { Request, Response, NextFunction } from 'express';
import getBrowser from '../browser';
import Joi, { validate } from 'joi';

const router = express.Router();

const schema = Joi.object({
  html: Joi.string(),
  url: Joi.string().uri({
    scheme: ['http', 'https'],
  }),
  options: Joi.object({
    type: Joi.string().valid('png', 'jpeg'),
    quality: Joi.when('type', {
      is: 'jpeg',
      then: Joi.number()
        .min(0)
        .max(100),
      otherwise: Joi.forbidden(),
    }),
    fullPage: Joi.boolean(),
    clip: Joi.object({
      x: Joi.number()
        .min(0)
        .required(),
      y: Joi.number()
        .min(0)
        .required(),
      width: Joi.number()
        .min(0)
        .required(),
      height: Joi.number()
        .min(0)
        .required(),
    }),
    omitBackground: Joi.boolean(),
  }),
})
  .xor('html', 'url')
  .label('root');

router.post(
  '/',
  (req: Request, res: Response, next: NextFunction) => {
    validate(req.body, schema, (err, value) => {
      if (err) {
        return res.status(422).json({
          message: 'The given data is invalid.',
          errors: err.details.map(({ message, path }) => ({
            message: message.replace(/\"/g, ''),
            path,
          })),
        });
      }

      next();
    });
  },
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = req.body.url;
      const html = req.body.html;
      const options = req.body.options || {};

      const browser = await getBrowser();
      const page = await browser.newPage();

      if (url) {
        await page.goto(url, { waitUntil: 'load' });
      } else if (html) {
        await page.setContent(html, { waitUntil: 'load' });
      }

      const buffer = await page.screenshot(options);

      res.type('image/png').send(buffer);

      page.close();
    } catch (e) {
      next(e);
    }
  },
);

export default router;
