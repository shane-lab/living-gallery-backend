import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';

import { IInjectable, Provider, DecoratedTarget, getParamTypes, getProvider } from './DependencyInjection';

const isPrimitive = (type: any) => ['string', 'number', 'boolean', 'object'].indexOf(type.toLowerCase()) >= 0;

interface IRedirectOptions {
    path: string | string[];
    destination: string;
    router?: string;
    code?: number;
}

interface IRouterAlias {
    name: string;
    destination: string;
}

interface IInjectableRouterOptions {
    prefix: string;
    skipDefaultRoute?: boolean;
    aliases?: IRouterAlias[];
    redirects?: IRedirectOptions[]
    providers?: Function[];
};

declare type RouterHandlerTypes = 'get' | 'put' | 'post' | 'delete';

interface IRoute {
    path: string;
    type: RouterHandlerTypes;
    func: Function;
}

declare type RouterRoute = Function & IRoute;

declare type ParamTypes = 'params' | 'query' | 'body' | 'headers';

interface IRouteParam {
    name: string;
    type: ParamTypes;
    methodName: string;
    index: number;
}

interface IInjectableRouter<T> {
    new(...data: {[key:string]: any}[]): T
    injectable?: true;
    args?: any[];
    routes?: RouterRoute[];
    params?: IRouteParam[];
    options?: IInjectableRouterOptions
}

declare type RouterProvider<T> = DecoratedTarget<T> & IInjectableRouter<T>

export const InjectableRouter = <T>(data?: IInjectableRouterOptions) => {
    return function(target: DecoratedTarget<T>) {
        const router = target as RouterProvider<T>
        router.injectable = true;
        router.options = data;
        router.routes = router.routes || [];
        router.args = [];

        if (router.options && !/^\//.test(router.options.prefix)) {
            router.options.prefix = `\/${router.options.prefix}`;
        }

        const paramtypes = getParamTypes(router);
        
        if (paramtypes && paramtypes.length) {
            const resolvedParams = resolveParamTypes(target, paramtypes);

            if (paramtypes.length !== resolvedParams.length) {
                throw new Error(`Missmatching injectable parameters resolved ${resolvedParams.length} out of ${paramtypes.length}`);
            }

            router.args = resolvedParams;
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

export const Param = (name: string, type: ParamTypes = 'params') => {
    return function (target: any, methodName, index: number) {
        const routerClass = target.constructor as IInjectableRouter<any>;

        const param = { name, type, methodName, index } as IRouteParam;

        const params = routerClass.params = (routerClass.params || [] as IRouteParam[]);

        params.push(param);
    }
}

export const KoaRouterFactory = <T>(target: IInjectableRouter<T>, prefix?: string) => {
    if (target && !(typeof target === 'function' && target.injectable)) {
        const type = typeof target;
        throw new Error(`The given provider '${type === 'function' ? target.name : type}' is not decorated as an instance of injectable router`);
    }

    const injectableRouter = new target(...target.args);

    let options = target.options;
    if (prefix && /^\/w+/.test(prefix)) {
        options = Object.assign(target.options, { prefix })
    }

    if (!options.prefix) {
        throw new Error(`No prefix set for injectable router '${target.name}'`);
    }

    const router = new KoaRouter(options);

    let aliasedRouters: KoaRouter[];
    if (options.aliases) {
        aliasedRouters = [];
        options.aliases.forEach(alias => {
            let prefix = alias.name;
            if (!!prefix) {
                prefix = /^\//.test(prefix) ? prefix : `/${prefix}`;
            }

            const destination = options.prefix + alias.destination;
            
            const aliasedRouter = new KoaRouter({ prefix });
            aliasedRouter.redirect('/', destination, 302);

            aliasedRouters.push(aliasedRouter);
        });
    }
    
    if (options.redirects) {
        options.redirects.forEach(redirect => {

            let prefix = redirect.router;
            if (!!prefix) {
                prefix = /^\//.test(prefix) ? prefix : `/${prefix}`;
            }
            
            const destination = (prefix || options.prefix) + redirect.destination;
            
            if (Array.isArray(redirect.path)) {
                redirect.path.forEach(path => router.redirect(path, destination, redirect.code || 302));
            } else {
                router.redirect(redirect.path as string, destination, redirect.code || 302);
            }
        });
    }
    
    if (target.routes) {
        target.routes.forEach(route => router[route.type](route.path, async (ctx) => ctx.body = await injectableRouter[route.func.name](...invokeKoaRouteParams(ctx, route, target.params))));
    }

    // all routers come with a default index action (protocol:://host:?port/router{/?...routes}), this can be overriden in the decorated router class
    if (!options.skipDefaultRoute) {
        router.get('/', async (ctx) => ctx.body = `${options.prefix || target.name} -> index`);
    }
    
    return { router, aliasedRouters };
}

function invokeKoaRouteParams(ctx: KoaRouter.IRouterContext, route: RouterRoute, params: IRouteParam[]) {
    return params && params
        .filter(param => param.methodName === route.func.name)
        .sort((a, b) => a.index - b.index)
        .map(param => param.type === 'body' ? !!param.name ? ctx.request.body[param.name] : ctx.request.body : ctx[param.type][param.name] || null) || [];
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