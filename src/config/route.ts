import { Router, Express } from 'express';
import fg from 'fast-glob';

const ROUTES_DIR =
  process.env.NODE_ENV === 'production'
    ? '**/routes/**Route.js'
    : '**/routes/**Route.ts';

export const setupRoute = (app: Express): void => {
  const router = Router();

  app.use('/', router);
  fg.sync(ROUTES_DIR).map(async (routeFile) => {
    const route = (await import(`../../${routeFile}`)).default;
    route(router);
    console.log(
      'All routes: ',
      router.stack.map((item) => ({
        path: `/${item.route.path}`,
        method: item.route.methods
      }))
    );
  });
};
