import * as KoaRouter from 'koa-router';
import { Connection } from 'typeorm';

const compose = require('koa-compose');

module.exports = (connection: Connection) => {

    const routers: KoaRouter[] = [require('./api')];

    const middlewares: KoaRouter.IMiddleware[] = [];
    routers.forEach(router => {
        middlewares.push(router.routes())
        middlewares.push(router.allowedMethods())
    });

    return compose(middlewares);
}