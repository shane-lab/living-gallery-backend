import { AuthRouter } from './AuthRouter';

import { KoaRouterFactory } from '../../decorators/Router';

export const router = module.exports = KoaRouterFactory(AuthRouter);