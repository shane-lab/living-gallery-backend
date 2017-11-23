import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';

import { RouterRoute, IInjectableRouter, IRouteParam } from '../decorators/Router';
import { IMiddleware } from 'koa-router';

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
        target.routes.forEach(route => router[route.type](route.path, ...(route.middlewares || []) as IMiddleware[], async (ctx) => ctx.body = await injectableRouter[route.func.name](...invokeKoaRouteParams(ctx, route, target.params))));
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