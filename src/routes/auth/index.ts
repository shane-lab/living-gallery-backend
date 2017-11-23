import { AuthRouter } from './AuthRouter';

import { KoaRouterFactory } from '../../factories/KoaRouterFactory';

export const router = module.exports = KoaRouterFactory(AuthRouter);