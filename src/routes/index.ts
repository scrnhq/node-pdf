import express, { Request, Response, NextFunction } from 'express';
import getBrowser from '../browser';

const router = express.Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = req.body.url;
    const html = req.body.html;
    const options = req.body.options || {};

    const browser = await getBrowser();
    const page = await browser.newPage();

    if (url) {
      await page.goto(url, { waitUntil: 'load' });
    } else {
      await page.setContent(html, { waitUntil: 'load' });
    }

    const buffer = await page.pdf(options);

    res.type('application/pdf').send(buffer);
  } catch (e) {
    next(e);
  }
});

export default router;
