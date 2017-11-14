import { ApiRouter } from './ApiRouter';

import { KoaRouterFactory } from '../../decorators/Router';

export const router = module.exports = KoaRouterFactory(ApiRouter);

// console.log(apirouter);

// try {
//     apirouter.getAllClients()
//         .then(clients => console.log('clients:', clients))
//         .catch(err => console.error(chalk.default.red(err.message || err) as string));
// } catch (err) {
//     console.error(err.message || err);
// }

// export const router = module.exports = new Router({ prefix: '/api' });

// router.get('/', async (ctx) => ctx.body = 'API route');

// router.get('/auth/', /* authication handler */)

// router.get('/clients/', controller.listClients);
// router.post('/clients/', controller.createClient);

// router.get('/clients/:id', controller.findClient);
// router.put('/clients/:id', controller.updateClient);
// router.del('/clients/:id', controller.deleteClient);
