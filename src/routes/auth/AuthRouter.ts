import { UserController, User } from '../../controllers/UserController';

import { InjectableRouter as Router, Route, Param } from '../../decorators/Router';

@Router({ 
    prefix: 'auth',
    aliases: [{
        name: 'login',
        destination: '/login'
    }, {
        name: 'registere',
        destination: '/register'
    }],
    redirects: [{
        path: '/',
        destination: '/clients',
        router: 'api'
    }]
})
export class AuthRouter { 

    constructor(private userController: UserController) { }

    @Route('/')
    public index() {
        console.log('authrouter/index')

        return 'authrouter/index';
    }

    @Route('/login')
    public login() {
        console.log('authrouter/login')

        return 'authrouter/login';
    }

    @Route('/register')
    public register() {
        console.log('authrouter/register')

        return 'authrouter/register';
    }
}