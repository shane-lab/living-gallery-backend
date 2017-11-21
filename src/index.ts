import 'reflect-metadata';
import * as Koa from 'koa';
import * as typeorm from 'typeorm';

import convert = require('koa-convert');

import * as chalk from 'chalk';

interface TypeOrmContext extends Koa.BaseContext {
    db?: typeorm.Connection;
}

declare type TypedApplication = Koa & { context: TypeOrmContext };

module.exports.getApp = async (type?: string): Promise<TypedApplication> => {
    const connectionType = process.env.NODE_ENV = type || process.env.NODE_ENV || 'development';

    const config = (require("../ormconfig") as typeorm.ConnectionOptions[]).find(type => type.name === connectionType);

    console.log(chalk.default`creating connection for type {blue ${connectionType}}, awaiting connection...`);
    if (!config) {
        throw new Error(`No typeorm connection configured for type '${connectionType}'`);
    }

    let connection: typeorm.Connection;
    try {
        connection = await typeorm.createConnection(config);

        console.log(chalk.default`...{blue typorm} connection set`);
    } catch (err) {
        throw new Error(err.message || err || `Unable to connect to driver set for connection '${connectionType}'`);
    }

    const app = new Koa() as TypedApplication;
    
    app.use(async (ctx, next) => {
        try {
            await next();
    
            if (!ctx.body) {
                ctx.throw(404);
            }
        } catch (err) {
            ctx.status = err.status || 500;
            ctx.body = err.message;
            ctx.app.emit('error', err, ctx);
        }
    });

    app.context.db = connection;
    
    app.use(require('koa-helmet')({
        frameguard: {
            action: 'deny'
        }
    }))
    app.use(require('koa-logger')());
    app.use(require('koa-useragent'));
    app.use(require('koa-bodyparser')());
    
    // convert from es6 generator functions to es7 async/await
    app.use(convert(require('koa-res')()));
    app.use(convert(require('koa-serve')('./public')));
    
    // serve routes
    app.use(require('./routes')(connection));

    return app;
};