import { ClientController } from '../../controllers/ClientController';
import { Inject, InjectableRouter } from '../../decorators';

import { Client } from '../../entities/Client';

@InjectableRouter({
    providers: [ClientController]
})
export class ApiRouter {

    @Inject(ClientController)
    private clientController: ClientController;

    public get all() {
        return this.clientController.getAll();
    }
}