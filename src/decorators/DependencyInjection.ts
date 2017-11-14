export interface IInjectable<T> {
    new(...data: any[]): T
    injectable?: true,
    predicate?: (target: T) => void
};

export declare type DecoratedTarget<T> = Function | (new () => T) | Object;

export declare type Provider<T> = DecoratedTarget<T> & IInjectable<T>;

const metadata = (target: any, type: string, key?: string) => Reflect && (Reflect as any).getMetadata ? (Reflect as any).getMetadata(`design:${type}`, target, key) : undefined;

export const Inject = <T>(typeFunction?: IInjectable<T>, ...data: any[]) => {
    if (typeFunction && !(typeof typeFunction === 'function' && typeFunction.injectable)) {
        const type = typeof typeFunction;
        throw new Error(`Decorated class member for type '${type === 'function' ? typeFunction.name : type}' is not injectable`);
    }

    return function (target: DecoratedTarget<T>, propertyName: string) {
        typeFunction = typeFunction || Injector.getType(target, propertyName);

        if (!typeFunction) {
            throw new Error(`No type was specified for decorated class member '${propertyName}' in [${target.constructor.name}]`);
        }

        let provider = Injector.getProvider(typeFunction);
        if (provider && typeFunction.prototype !== Object.getPrototypeOf(provider)) {
            if (typeFunction.prototype !== Object.getPrototypeOf(provider)) {
                // remove undefined fields in base class
                Object.keys(provider).forEach(key => provider[key] === undefined && delete provider[key])

                provider = Object.assign(new typeFunction(data), provider);

                console.log(provider['getAll']);

                if (!data) {
                    Injector.setProvider(typeFunction, provider);
                }
            }

            target[propertyName] = provider;
            
            return;
        }
        
        try {
            const injected = target[propertyName] = new typeFunction(data);

            if ('predicate' in typeFunction && typeof typeFunction.predicate === 'function') {
                typeFunction.predicate(injected);
            }

            if (!data) {
                Injector.setProvider(typeFunction, injected);
            }
        } catch (err) {
            throw new Error(err.message || err);
        }
    };
}

export const Injectable = <T>(predicate?: (target: T) => void) => {
    return function (target: DecoratedTarget<T>) {
        const provider = target as Provider<T>;

        provider.injectable = true;
        if (predicate && typeof predicate === 'function') {
            provider.predicate = predicate;
        }

        Injector.setProviderType(provider);
    }
}

interface IMappedProvider<T> {
    target: Function,
    provider: IInjectable<T>
}

class Injector {

    // store injectables
    private static providers: Map<Function | IInjectable<any>, any> = new Map();

    constructor() {
        throw new Error();
    }

    public static setProviderType<T>(typeFunction: IInjectable<T>, ...data: any[]) {
        const provider = new typeFunction(data);
        
        if ('predicate' in typeFunction && typeFunction['predicate']) {
            typeFunction.predicate(provider);
        }

        Injector.setProvider(typeFunction, provider);
    }

    public static setProvider<T>(typeFunction: Function | IInjectable<T>, provider: T) {
        Injector.providers.set(typeFunction, provider);
    }

    public static getProvider<T>(typeFunction: Function | IInjectable<T>): T {
        // check if class is derrived and injectable but not registered
        if (typeFunction['injectable'] && !Injector.isProviderType(typeFunction)) {
            return Injector.getProvider(Object.getPrototypeOf(typeFunction));
        }

        return Injector.providers.get(typeFunction);
    }

    public static isProviderType(typeFunction: Function | IInjectable<any>) {
        return Injector.providers.get(typeFunction) !== undefined;
    }
    
    public static getParamTypes<T>(target: DecoratedTarget<T>): any[] {
        return metadata(target, 'paramtypes');
    }

    public static getType<T>(target: DecoratedTarget<T>, key?: string) {
        return metadata(target, 'type', key);
    }
}

export const getType = Injector.getType;

export const getParamTypes = Injector.getParamTypes;

export const getProvider = Injector.getProvider;