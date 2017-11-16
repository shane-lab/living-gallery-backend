import * as KoaRouter from 'koa-router';
import { Connection } from 'typeorm';

const compose = require('koa-compose');

interface IRouterCollection {
    router: KoaRouter,
    aliasedRouters?: KoaRouter[];
}

module.exports = (connection: Connection) => {
    if (!connection.isConnected) {
        throw new Error(`Connection with '${connection.name}' is not set or has ended`);
    }

    const routers: IRouterCollection[] = [require('./api'), require('./auth')];

    const middlewares: KoaRouter.IMiddleware[] = [];
    routers.forEach(router => {
        middlewares.push(router.router.routes())
        middlewares.push(router.router.allowedMethods())
        
        if (router.aliasedRouters) {
            router.aliasedRouters.forEach(aliasedRouter => {
                middlewares.push(aliasedRouter.routes())
                middlewares.push(aliasedRouter.allowedMethods());
            })
        }
    });

    return compose(middlewares);
}