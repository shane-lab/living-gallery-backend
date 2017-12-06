import { Connection } from 'typeorm';

import { BaseController, Method } from '../BaseController';

import { Creature } from '../entities/Creature';

export class CreatureController extends BaseController<Creature> {

    constructor(connection: Connection) {
        super(connection, Creature);
    }

    protected validate(fields: Partial<Creature>, method: Method) { }

    async getByClientId(clientId: string | number) {
        const creatures = await this.getAll();

        return creatures.filter(creature => creature.client.uuid.toString() === clientId.toString());
    }
}

export { Creature };