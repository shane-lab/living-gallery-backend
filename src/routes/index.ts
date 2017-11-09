import { Context } from 'koa';
import * as KoaRouter from 'koa-router';
import { Connection, getConnection } from 'typeorm';

import { ClientController } from '../controllers/ClientController';

declare type RouteCallback = (ctx: Context, next?: () => Promise<any>) => Promise<void>;

export interface IController {
    [key: string]: RouteCallback

    // index required for checking existence of router in taskrunner
    index: RouteCallback
};

const compose = require('koa-compose');

module.exports = (connection: Connection) => {
    
    // const clientController = new ClientController(connection);

    // clientController.add()
    //     .then(client => clientController.add({ neighbors: [client]}))
    //     .then(client => console.log(client))
    //     .catch(err => console.log(err));

    const routers: KoaRouter[] = [require('./api')];

    const middlewares: KoaRouter.IMiddleware[] = [];
    routers.forEach(router => {
        middlewares.push(router.routes())
        middlewares.push(router.allowedMethods())
    });

    return compose(middlewares);
}