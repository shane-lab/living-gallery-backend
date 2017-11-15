import * as KoaRouter from 'koa-router';
import { Connection } from 'typeorm';

const compose = require('koa-compose');

module.exports = (connection: Connection) => {
    if (!connection.isConnected) {
        throw new Error(`Connection with '${connection.name}' is not set or has ended`);
    }

    const routers: KoaRouter[] = [require('./api')];

    const middlewares: KoaRouter.IMiddleware[] = [];
    routers.forEach(router => {
        middlewares.push(router.routes())
        middlewares.push(router.allowedMethods())
    });

    return compose(middlewares);
}