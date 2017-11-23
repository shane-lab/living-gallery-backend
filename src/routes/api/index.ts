import { ApiRouter } from './ApiRouter';

import { KoaRouterFactory } from '../../factories/KoaRouterFactory';

export const router = module.exports = KoaRouterFactory(ApiRouter);