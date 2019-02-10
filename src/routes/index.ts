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
    scale: Joi.number()
      .min(0.1)
      .max(2),
    displayHeaderFooter: Joi.boolean(),
    headerTemplate: Joi.string(),
    footerTemplate: Joi.string(),
    printBackground: Joi.boolean(),
    landscape: Joi.boolean(),
    pageRanges: Joi.string(),
    format: Joi.string(),
    width: Joi.string(),
    height: Joi.string(),
    margin: Joi.object({
      top: Joi.string(),
      right: Joi.string(),
      bottom: Joi.string(),
      left: Joi.string(),
    }),
    preferCSSPageSize: Joi.boolean(),
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

      const buffer = await page.pdf(options);

      res.type('application/pdf').send(buffer);
    } catch (e) {
      next(e);
    }
  },
);

export default router;
