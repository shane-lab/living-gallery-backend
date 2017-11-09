import { Connection, getManager, Repository } from 'typeorm';

import { BaseEntity } from './BaseEntity';

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

    async getById(id: number) {
        return this.db().findOneById(id);
    }

    async add(fields: Partial<T>) {
        this.validate(fields);

        const entity = new this.type();
        for (let field in fields) {
            entity[field] = fields[field];
        }

        return await this.db().create(entity);
    }

    async updateById(id: number, fields: Partial<T>) {
        this.validate(fields);

        const entity = await this.getById(id);
        for (let field in fields) {
            entity[field] = fields[field];
        }

        return await this.db().updateById(id, entity);
    }

    async deleteById(id: number) {
        return await this.db().removeById(id);
    }
}