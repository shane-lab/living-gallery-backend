import * as Router from 'koa-router';
import * as chalk from 'chalk';

import { ApiRouter } from './ApiRouter';

const apirouter = new ApiRouter();

apirouter.all
    .then(clients => console.log(clients))
    .catch(err => console.log(chalk.default.red(err.message || err) as string));

export const router = module.exports = new Router({ prefix: '/api' });

router.get('/', async (ctx) => ctx.body = 'API route');

// router.get('/auth/', /* authication handler */)

// router.get('/clients/', controller.listClients);
// router.post('/clients/', controller.createClient);

// router.get('/clients/:id', controller.findClient);
// router.put('/clients/:id', controller.updateClient);
// router.del('/clients/:id', controller.deleteClient);
