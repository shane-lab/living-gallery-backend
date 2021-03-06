import { Connection } from 'typeorm';
import { NotFound } from 'http-errors';

import { BaseController, Method } from '../BaseController';

import { Client } from '../entities/Client';

export class ClientController extends BaseController<Client> {

    constructor(connection: Connection) {
        super(connection, Client);
    }

    protected validate(fields: Partial<Client>, method: Method) { }
}

class ClientNotFound extends NotFound {

    constructor(id?: number) {
        super(`Client ${!!id ? `with id ${id}`: ''} was not found`);
    }
}

export { Client };