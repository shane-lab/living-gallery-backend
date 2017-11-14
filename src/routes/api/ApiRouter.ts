import { ClientController, Client } from '../../controllers/ClientController';

import { InjectableRouter as Router, Route } from '../../decorators/Router';

declare type Id = string | number;

@Router({ prefix: 'api' })
export class ApiRouter {

    constructor(private clientController: ClientController) { }

    // @Route('/')
    // public index() {
    //     return // docs?
    // }

    @Route('/clients')
    public getAllClients() {
        return this.clientController.getAll();
    }

    @Route('/clients', 'post')
    public addClient(fields: Partial<Client>) {
        return this.clientController.add(fields);
    }

    @Route('/clients/:id')
    public getClientById(id: Id) {
        return this.clientController.getById(id);
    }

    @Route('/clients/:id', 'put')
    public updateClientById(id: Id, fields: Partial<Client>) {
        return this.clientController.updateById(id, fields);
    }

    @Route('/clients/:id', 'delete')
    public deleteClientById(id: Id) {
        return this.clientController.deleteById(id);
    }
}