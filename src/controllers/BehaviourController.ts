import { Connection } from 'typeorm';

import { BaseController, Method } from '../BaseController';

import { Behaviour } from '../entities/Behavior';
import { Creature } from '../entities/Creature';

export class BehaviourController extends BaseController<Behaviour> {

    constructor(connection: Connection) {
        super(connection, Behaviour);
    }

    protected validate(fields: Partial<Behaviour>, method: Method) { }

    async getByCreatureId(creatureId: string | number) {
        const creatureBuilder = await this.repo(Creature);

        const creature = await creatureBuilder.createQueryBuilder('creature')
            .where('creature.id = :id', {id: creatureId})
            .getOne();

        return creature.behaviours;
    }
}

export { Behaviour };