import { UserController, User } from '../../controllers/UserController';

import { InjectableRouter as Router, Route, Param } from '../../decorators/Router';

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
    }]
})
export class AuthRouter { 

    constructor(private userController: UserController) { }

    @Route('/login')
    public login() {
        return 'authrouter/login';
    }

    @Route('/register')
    public register() {
        return 'authrouter/register';
    }
}