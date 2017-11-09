import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import { PrimaryGeneratedColumn } from 'typeorm';
import * as chalk from 'chalk';

interface IInjectableRouterOptions {
    prefix?: string;
    providers: (Function | (new () => {})) & {injectable: true}[];
};

export const Inject = <T>(typeFunction: any, data?: any) => {
    if (typeof typeFunction !== 'function' && !typeFunction.injectable) {
        throw new Error(`Decorated class '${typeof typeFunction}' is not injectable`);
    }

    return function (target, propertyName) {
        const injected = target[propertyName] = new typeFunction(data);

        if ('predicate' in typeFunction) {
            typeFunction.predicate(injected);
        }

        return injected;
    };
}

export const Injectable = (predicate?: (target: any) => void) => {
    return function (target) {
        target.injectable = true;
        if (predicate) {
            target.predicate = predicate;
        }
    }
}

// @todo
export const InjectableRouter = (type: any, data?: IInjectableRouterOptions) => {
    return function(target) {
        console.log(chalk.default.cyan('InjectableRouter->target'));
        console.log(target);
    }
}

export const EnvironmentPrimaryColumn = (mappings?: {any}, type?: string) => {
    const env = type || process.env.NODE_ENV || 'development';

    const defaults = { name: 'id'}; 

    return env === 'development' ? PrimaryGeneratedColumn(defaults) : PrimaryGeneratedColumn('uuid', defaults);
}