import { Connection } from 'typeorm';

import { BaseController } from '../BaseController';

import { User } from '../entities/User';

export class UserController extends BaseController<User> {

    constructor(connection: Connection) {
        super(connection, User);
    }

    protected validate(fields: Partial<User>) { }

    public async authenticate(username: string, password: string) {
        // todo: add validation (JWT?)
        return await this.db().findOne({ email: username, password });
    }
}

export { User };