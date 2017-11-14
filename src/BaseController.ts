import { Connection, getConnection, getManager, Repository } from 'typeorm';
import { BadRequest } from 'http-errors';

import { BaseEntity } from './BaseEntity';

import { Injectable } from './decorators/DependencyInjection';

@Injectable((target: BaseController<T>) => target.connection = getConnection(process.env.NODE_ENV))
export abstract class BaseController<T extends BaseEntity<T>> {

    constructor(private connection: Connection, private type: (new () => T)) { }

    protected db(): Repository<T> {
        return this.connection.getRepository(this.type);
    }

    protected abstract validate(fields: Partial<T>);

    async getAll() {
        return await this.db().find({});
    }

    async getOne(fields: Partial<T>) {
        return await this.db().findOne(fields);
    }

    async getById(id: number|string) {
        return this.db().findOneById(id);
    }

    async add(fields?: Partial<T>) {
        this.validate(fields);

        const entity = await this.db().create(fields);

        if (!entity) {
            throw new BadRequest('Unable to create entity');
        }

        return await this.db().save(entity);
    }

    async updateById(id: number|string, fields: Partial<T>) {
        this.validate(fields);

        return await this.db().updateById(id, fields);
    }

    async deleteById(id: number|string) {
        return await this.db().removeById(id);
    }
}