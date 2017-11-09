import { Context } from 'koa';
import { Connection } from 'typeorm';

import { ClientController } from '../controllers/ClientController';

declare type RouteCallback = (ctx: Context, next?: () => Promise<any>) => Promise<void>;

export interface IController {
    [key: string]: RouteCallback

    // index required for checking existence of router in taskrunner
    index: RouteCallback
};

const compose = require('koa-compose');

module.exports = (connection: Connection) => {

    const clientController = new ClientController(connection);

    clientController.add({})
        .then(client => console.log('client:', client.createdAt))
        .catch(err => console.log(err));

    const routers = [require('./api')];

    const middlewares = [];
    routers.forEach(router => {
        middlewares.push(router.routes())
        middlewares.push(router.allowedMethods())
    });

    return compose(middlewares);
}