import { ApiRouter } from './ApiRouter';

import { KoaRouterFactory } from '../../decorators/Router';

export const router = module.exports = KoaRouterFactory(ApiRouter);
