import { Controller, All, Req, Res } from '@nestjs/common';
import { join } from 'path';
import { Request, Response } from 'express';

/**
 * Catch-all controller for SPA (Single Page Application) fallback.
 * Any non-API, non-asset route serves the frontend index.html,
 * so Vue Router can handle client-side navigation on page reload.
 */
@Controller()
export class AppController {
  @All('*')
  serveApp(@Req() req: Request, @Res() res: Response) {
    const path = req.path;

    // Let API and docs routes through
    if (path.startsWith('/api') || path.startsWith('/api-docs')) {
      res.status(404).json({ message: `Cannot ${req.method} ${path}`, error: 'Not Found', statusCode: 404 });
      return;
    }

    // Let static asset requests through (files with extension: .js, .css, .png etc.)
    // ServeStaticModule handles these; if they 404 naturally that's correct.
    if (/\.[a-z0-9]+$/i.test(path)) {
      res.status(404).send('Not found');
      return;
    }

    // SPA fallback: serve index.html for all clean routes (/, /login, /hives, etc.)
    const indexPath = join(__dirname, '..', 'frontend', 'dist', 'index.html');
    res.sendFile(indexPath);
  }
}
