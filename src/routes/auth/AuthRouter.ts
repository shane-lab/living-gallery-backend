import { UserController, User } from '../../controllers/UserController';

import { InjectableRouter as Router, Route, Param } from '../../decorators/Router';
import { JwtService } from '../../services/JwtService';

@Router({ 
    prefix: 'auth',
    skipDefaultRoute: true,
    aliases: [{
        name: 'login',
        destination: '/login'
    }, {
        name: 'register',
        destination: '/register'
    }],
    redirects: [{
        path: '/',
        destination: '/login'
    }],
    middleware: (ctx, next) => {
        const jwtService = ctx.fromProviders(JwtService);
        jwtService.resolve(ctx.headers);
        
        next();
    },
    providers: [JwtService]
})
export class AuthRouter {

    constructor(private userController: UserController) { }

    @Route('/login', { skipRouterMiddleware: true })
    public login() {
        return 'authrouter/login';
    }

    @Route('/register')
    public register() {
        return 'authrouter/register';
    }
}