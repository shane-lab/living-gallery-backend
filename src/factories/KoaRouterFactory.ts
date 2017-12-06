import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';

import { RouterRoute, IInjectableRouter, IRouteParam, IInjectableRouterOptions, RouterProvider, MiddlewareCallback } from '../decorators/Router';
import { DecoratedTarget } from '../decorators/DependencyInjection';
import { IMiddleware } from 'koa-router';

export const KoaRouterFactory = <T>(target: IInjectableRouter<T>, prefix?: string) => {
    if (target && !(typeof target === 'function' && target.injectable)) {
        const type = typeof target;
        throw new Error(`The given provider '${type === 'function' ? target.name : type}' is not decorated as an instance of injectable router`);
    }

    const subject = target as RouterProvider<T>;

    const injectableRouter = new subject(...subject.args);

    let options = Object.assign({}, subject.options) as IInjectableRouterOptions;
    if (prefix && typeof prefix === 'string' && /^\/{0,1}\w+$/.test(prefix) === true) {
        options = Object.assign(options, { prefix })
    }

    if (!options.prefix) {
        throw new Error(`No prefix set for injectable router '${subject.name}'`);
    }

    if (!/^\//.test(options.prefix)) {
        options.prefix = `/${options.prefix}`;
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

    // populate context with custom fields and methods
    const middleware = async (ctx: KoaRouter.IRouterContext, next: () => Promise<any>) => {
        ctx['router'] = injectableRouter;
        ctx['fromProviders'] = <T>(providerType: DecoratedTarget<T>) => subject.providers.get(providerType);
        ctx['redirect'] = ctx.redirect;
        await next();
    };

    if (subject.routes) {
        subject.routes.forEach(route => router[route.type](route.path, middleware, ...invokeKoaRouteMiddleware(route, options.middleware), async (ctx) => ctx.body = await injectableRouter[route.func.name](...invokeKoaRouteParams(ctx, route, subject.params))));
    }

    // all routers come with a default index action (protocol:://host:?port/router{/?...routes}), this can be overriden in the decorated router class
    if (!options.skipDefaultRoute) {
        router.get('/', async (ctx) => ctx.body = `${options.prefix || subject.name} -> index`);
    }

    return { router, aliasedRouters };
}

function invokeKoaRouteMiddleware(route: RouterRoute, routerMiddleware?: MiddlewareCallback) {
    route.middlewares = route.middlewares || [];
    if (!route.skipRouterMiddleware && !!routerMiddleware) {
        route.middlewares.splice(0, 0, routerMiddleware);
    }
    return route.middlewares as IMiddleware[]
}

function invokeKoaRouteParams(ctx: KoaRouter.IRouterContext, route: RouterRoute, params: IRouteParam[]) {
    return params && params
        .filter(param => param.methodName === route.func.name)
        .sort((a, b) => a.index - b.index)
        .map(param => param.type === 'body' ? !!param.name ? ctx.request.body[param.name] : ctx.request.body : ctx[param.type][param.name] || null) || [];
}