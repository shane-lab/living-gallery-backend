import { IInjectable, Provider, DecoratedTarget, getParamTypes, getProvider } from './DependencyInjection';

export interface IRedirectOptions {
    path: string | string[];
    destination: string;
    router?: string;
    code?: number;
}

export interface IRouterAlias {
    name: string;
    destination: string;
}

export interface IInjectableRouterOptions {
    prefix: string;
    skipDefaultRoute?: boolean;
    aliases?: IRouterAlias[];
    redirects?: IRedirectOptions[]
    providers?: Function[];
};

export declare type RouterHandlerTypes = 'get' | 'put' | 'post' | 'delete';

export interface IMiddlewareContext {
    session?: any;
    req: any;
    res: any;
    throw: (statusCode: number, message: number) => void;
}

export declare type MiddlewareCallback = (ctx: IMiddlewareContext, next: () => Promise<any>) => void | Promise<void>;

export interface IRoute {
    path: string;
    type: RouterHandlerTypes;
    func: Function;
    middlewares?: MiddlewareCallback[]
}

export declare type RouterRoute = Function & IRoute;

export declare type ParamTypes = 'params' | 'query' | 'body' | 'headers';

export interface IRouteParam {
    name: string;
    type: ParamTypes;
    methodName: string;
    index: number;
}

export interface IInjectableRouter<T> {
    new(...data: {[key:string]: any}[]): T
    injectable?: true;
    args?: any[];
    routes?: RouterRoute[];
    params?: IRouteParam[];
    options?: IInjectableRouterOptions
}

export declare type RouterProvider<T> = DecoratedTarget<T> & IInjectableRouter<T>;

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

interface IRouteOptions {
    type?: RouterHandlerTypes;
    middlewares?: MiddlewareCallback[];
}

export const Route = (path: string, typeOrOpts: IRouteOptions | RouterHandlerTypes = 'get') => {
    return function (target: any, prop: string, descriptor: PropertyDescriptor) {
        const routerClass = target.constructor as IInjectableRouter<any>;

        const route = descriptor.value as RouterRoute;
        route.path = path;
        route.type = typeof typeOrOpts === 'string' ? typeOrOpts : typeOrOpts.type || 'get';
        if (!!typeOrOpts && typeof typeOrOpts !== 'string') {
            route.middlewares = typeOrOpts.middlewares;
        }
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