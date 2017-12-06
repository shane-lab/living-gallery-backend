import { InjectableRouter as Router, Route, Param } from '../../decorators/Router';

import { ClientController, Client } from '../../controllers/ClientController';
import { CreatureController, Creature } from '../../controllers/CreatureController';
import { UserController, User } from '../../controllers/UserController';

import { JwtService } from '../../services/JwtService';
import { BehaviourController } from '../../controllers/BehaviourController';

declare type Id = string | number;

@Router({
    prefix: 'api',
    providers: [JwtService]
})
export class ApiRouter {

    constructor(
        private behaviourController: BehaviourController,
        private clientController: ClientController,
        private creatureController: CreatureController,
        private userController: UserController) { }

    @Route('/')
    public index() {
        return 'index action'; // api docs?
    }

    @Route('/behaviours')
    public getAllBehaviours() {
        return this.behaviourController.getAll();
    }

    @Route('/behaviours', 'post')
    public addBehaviour(@Param(null, 'body') fields: Partial<Client>) {
        return this.behaviourController.add(fields);
    }

    @Route('/behaviours/:id')
    public getBehaviourById(@Param('id') id: Id) {
        return this.behaviourController.getById(id);
    }

    @Route('/behaviours/:id', 'put')
    public updateBehaviourById(@Param('id') id: Id, @Param(null, 'body') fields: Partial<Client>) {
        return this.behaviourController.updateById(id, fields);
    }

    @Route('/behaviours/:id', 'delete')
    public deleteBehaviourById(@Param('id') id: Id) {
        return this.behaviourController.deleteById(id);
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

    @Route('/clients/:id/creatures', {
        middlewares: [async (ctx, next) => {
            // const jwtService = ctx.fromProviders(JwtService);
            // jwtService.resolve(ctx.headers);

            await (ctx.router as ApiRouter).clientController.getById(ctx.params.id);
            await next();
        }]
    })
    public getAllClientCreatures(@Param('id') id: Id) {
        return this.creatureController.getByClientId(id);
    }

    // @Route('/clients/:id/creatures')
    // public getAllClientCreatures(@Param('id') id: Id) {
    //     return this.clientController.getById(id)
    //         .then(client => this.creatureController.getByClientId(client.uuid));
    // }

    @Route('/creatures')
    public getAllCreatures() {
        return this.creatureController.getAll();
    }

    @Route('/creatures', 'post')
    public addCreature(@Param(null, 'body') fields: Partial<Creature>) {
        return this.creatureController.add(fields);
    }

    @Route('/creatures/:id')
    public getCreatureById(@Param('id') id: Id) {
        return this.creatureController.getById(id);
    }

    @Route('/creatures/:id', 'put')
    public updateCreatureById(@Param('id') id: Id, @Param(null, 'body') fields: Partial<Creature>) {
        return this.creatureController.updateById(id, fields);
    }

    @Route('/creatures/:id', 'delete')
    public deleteCreatureById(@Param('id') id: Id) {
        return this.creatureController.deleteById(id);
    }

    @Route('/creatures/:id/behaviours', {
        middlewares: [async (ctx, next) => {
            await (ctx.router as ApiRouter).creatureController.getById(ctx.params.id);
            await next();
        }]
    })
    public getAllCreatureBehaviours(@Param('id') id: Id) {
        return this.behaviourController.getByCreatureId(id);
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