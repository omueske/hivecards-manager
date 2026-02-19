import { Controller, Get, Req, Res, All } from '@nestjs/common';
import { join } from 'path';
import { Request, Response } from 'express';

/**
 * Catch-all controller for SPA (Single Page Application) fallback.
 * Any route that is not an API route serves the frontend index.html,
 * so Vue Router can handle client-side navigation on page reload.
 */
@Controller()
export class AppController {
  @All('*')
  serveApp(@Req() req: Request, @Res() res: Response) {
    const path = req.path;

    // Let API and docs routes through (should be handled by their own controllers)
    if (path.startsWith('/api') || path.startsWith('/api-docs')) {
      res.status(404).json({ message: `Cannot ${req.method} ${path}`, error: 'Not Found', statusCode: 404 });
      return;
    }

    // Serve index.html for all other paths (SPA fallback)
    res.sendFile(join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  }
}
