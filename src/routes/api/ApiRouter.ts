import { InjectableRouter as Router, Route, Param } from '../../decorators/Router';

import { ClientController, Client } from '../../controllers/ClientController';
import { UserController, User } from '../../controllers/UserController';

declare type Id = string | number;

@Router({ prefix: 'api' })
export class ApiRouter {

    constructor(private clientController: ClientController, private userController: UserController) { }

    @Route('/')
    public index() {
        return 'index action'; // api docs?
    }

    @Route('/clients')
    public getAllClients() {
        return this.clientController.getAll();
    }

    @Route('/clients', 'post')
    public addClient(@Param(null, 'body') fields: Partial<Client>) {
        return this.clientController.add(fields);
    }

    @Route('/clients/:id')
    public getClientById(@Param('id') id: Id) {
        return this.clientController.getById(id);
    }

    @Route('/clients/:id', 'put')
    public updateClientById(@Param('id') id: Id, @Param(null, 'body') fields: Partial<Client>) {
        return this.clientController.updateById(id, fields);
    }

    @Route('/clients/:id', 'delete')
    public deleteClientById(@Param('id') id: Id) {
        return this.clientController.deleteById(id);
    }

    @Route('/auth', 'post')
    public authenticate(@Param('username', 'body') username: string, @Param('password', 'body') password: string) {
        return this.userController.authenticate(username, password);
    }
    
    @Route('/users')
    public getAllUsers() {
        return this.userController.getAll();
    }

    @Route('/users', 'post')
    public addUser(@Param(null, 'body') fields: Partial<User>) {
        return this.userController.add(fields);
    }

    @Route('/users/:id')
    public getUserById(@Param('id') id: Id) {
        return this.userController.getById(id);
    }

    @Route('/users/:id', 'put')
    public updateUserById(@Param('id') id: Id, @Param(null, 'body') fields: Partial<Client>) {
        return this.userController.updateById(id, fields);
    }

    @Route('/users/:id', 'delete')
    public deleteUserById(@Param('id') id: Id) {
        return this.userController.deleteById(id);
    }
}