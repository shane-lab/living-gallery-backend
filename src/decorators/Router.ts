import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as chalk from 'chalk';

import { IInjectable, Provider, DecoratedTarget, getParamTypes, getProvider } from './DependencyInjection';

const isPrimitive = (type: any) => ['string', 'number', 'boolean', 'object'].indexOf(type.toLowerCase()) >= 0;

interface IInjectableRouterOptions {
    prefix: string;
    providers?: Function[];
};

declare type RouterHandlerTypes = 'get' | 'put' | 'post' | 'delete';

interface IRoute {
    path: string;
    type: RouterHandlerTypes;
    func: Function;
}

declare type RouterRoute = Function & IRoute;

interface IInjectableRouter<T> {
    new(...data: {[key:string]: any}[]): T
    injectable?: true;
    params?: any[];
    routes?: RouterRoute[];
    options?: IInjectableRouterOptions
}

declare type RouterProvider<T> = DecoratedTarget<T> & IInjectableRouter<T>

export const InjectableRouter = <T>(data?: IInjectableRouterOptions) => {
    return function(target: DecoratedTarget<T>) {
        const router = target as RouterProvider<T>
        router.injectable = true;
        router.options = data;
        router.routes = router.routes || [];

        if (router.options && !/^\//.test(router.options.prefix)) {
            router.options.prefix = `\/${router.options.prefix}`;
        }

        const paramtypes = getParamTypes(router);
        
        if (paramtypes && paramtypes.length) {
            const resolvedParams = resolveParamTypes(target, paramtypes);

            if (paramtypes.length !== resolvedParams.length) {
                throw new Error(`Missmatching injectable parameters resolved ${resolvedParams.length} out of ${paramtypes.length}`);
            }

            router.params = resolvedParams;
        }
    }
}

export const Route = (path: string, type: RouterHandlerTypes = 'get') => {
    return function (target: any, prop: string, descriptor: PropertyDescriptor) {
        const routerClass = target.constructor as IInjectableRouter<any>;

        const route = descriptor.value as RouterRoute;
        route.path = path;
        route.type = type;
        route.func = descriptor.value;

        const routes = routerClass.routes = (routerClass.routes || []) as RouterRoute[];

        routes.push(route);
    }
}

export const KoaRouterFactory = <T>(target: IInjectableRouter<T>, prefix?: string) => {
    if (target && !(typeof target === 'function' && target.injectable)) {
        const type = typeof target;
        throw new Error(`The given provider '${type === 'function' ? target.name : type}' is not decorated as an instance of injectable router`);
    }

    const injectableRouter = new target(...target.params);

    let options = target.options;
    if (prefix && /^\/w+/.test(prefix)) {
        options = Object.assign(target.options, { prefix })
    }

    if (!options.prefix) {
        throw new Error(`No prefix set for injectable router '${target.name}'`);
    }

    const router = new KoaRouter(options);

    target.routes.forEach(route => router[route.type](route.path, async (ctx) => ctx.body = await injectableRouter[route.func.name]()));

    router.get('/', async (ctx) =>  ctx.body = `${options.prefix || target.name} -> index`);

    return router;
}

function resolveParamTypes<T>(target: DecoratedTarget<T>, handlers: IInjectable<any>[]) {
    return handlers.map(handler => {
        let provider = getProvider(handler);

        if (!provider) {
            return undefined;
        }
        
        if (!(provider instanceof handler)) {
            provider = merge(handler, provider);
        }

        return provider;
    }).filter(resolved => !!resolved);
}

function merge<T>(handler: IInjectable<T>, provider: T): T {
    Object.keys(provider).forEach(key => provider[key] === undefined && delete provider[key]);

    return Object.assign(new handler() as any, provider) as T;
}