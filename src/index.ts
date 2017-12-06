import 'reflect-metadata';
import * as Koa from 'koa';
import * as typeorm from 'typeorm';

import convert = require('koa-convert');

import * as chalk from 'chalk';

interface ITypeOrmContext extends Koa.BaseContext {
    db?: typeorm.Connection;
}

declare type TypedApplication = Koa & { context: ITypeOrmContext };

/**
 * g1: driver type
 * g2: username
 * g3: password
 * g4: host
 * g5?: :port
 * g5 | g6: database
 */
const uriRegex = /^\w+:\/\/[aA-zZ0-9]+:[aA-zZ0-9]+@[aA-zZ0-9-_.]+\.\w+(:\d{2,4}){0,1}\/[aA-zZ0-9]+$/gm;

interface IDbConfig {
    type: string,
    user: string,
    pass: string,
    host: string,
    port?: string | number,
    name: string
};

const databaseConfig = (url: string): IDbConfig => {
    if (!url || !uriRegex.test((url = url.trim()))) {
        return undefined;
    }

    const type = url.substr(0, url.indexOf(':'));
    // + ://
    url = url.substr(type.length + 3, url.length);
    const user = url.substr(0, url.indexOf(':'));
    // + :
    url = url.substr(user.length + 1, url.length);
    const pass = url.substr(0, url.lastIndexOf('@'));
    // + @
    url = url.substr(pass.length + 1, url.length);
    const hostWithPort = url.substr(0, url.lastIndexOf('/'));
    let host = hostWithPort;
    let port = 80 as string | number;
    if (hostWithPort.includes(':')) {
        host = hostWithPort.substr(0, hostWithPort.indexOf(':'));
        port = hostWithPort.substr(hostWithPort.indexOf(':') + 1, hostWithPort.length);
    }
    // + /
    url = url.substr(hostWithPort.length + 1, url.length);

    return {
        type,
        user,
        pass,
        host,
        port,
        name: url
    };
}

module.exports.getApp = async (type?: string): Promise<TypedApplication> => {
    const connectionType = process.env.NODE_ENV = type || process.env.NODE_ENV || 'development';

    let config = (require("../ormconfig") as typeorm.ConnectionOptions[]).find(type => type.name === connectionType);

    if (!!config && connectionType === 'production' && process.env.HEROKU_DEPLOYED) {
        const {name, migrations, entities, cli, synchronize} = config;

        const dbConfig = databaseConfig(process.env.DATABASE_URL) || {} as IDbConfig;

        config = Object.assign({name, migrations, entities, cli, synchronize}, {
            type: dbConfig.type || process.env.TYPEORM_DRIVER_TYPE,
            host: dbConfig.host || process.env.TYPEORM_HOST,
            port: dbConfig.port || process.env.TYPEORM_PORT,
            // nullable fields:
            database: dbConfig.name || process.env.TYPORM_DATABASE || undefined,
            username: dbConfig.user || process.env.TYPORM_USERNAME || undefined,
            password: dbConfig.pass || process.env.TYPORM_PASSWORD || undefined,
            extra: JSON.parse(process.env.TYPEORM_EXTRA || '{}')
        }) as any;

        Object.keys(config).forEach(key => config[key] === undefined && delete config[key]);
    }

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
    }));
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