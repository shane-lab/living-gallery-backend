import { Connection, getConnection, getManager, Repository } from 'typeorm';
import * as HttpErrors from 'http-errors';

import { BaseEntity } from './BaseEntity';

import { Injectable } from './decorators/DependencyInjection';

export declare type Method = 'select' | 'insert' | 'update' | 'delete';

@Injectable((target: BaseController<T>) => target.connection = getConnection(process.env.NODE_ENV))
export abstract class BaseController<T extends BaseEntity<T>> {

    constructor(private connection: Connection, private type: (new () => T)) { }

    protected db(): Repository<T> {
        return this.connection.getRepository(this.type);
    }

    protected abstract validate(fields: Partial<T>, method: Method);

    async getAll() {
        return await this.db().find({});
    }

    async getOne(fields: Partial<T>) {
        const entity = await this.db().findOne(fields);

        if (!entity) {
            throw new HttpErrors.UnprocessableEntity();
        }

        return entity;
    }

    async getById(id: number|string) {
        const entity = await this.db().findOneById(id);

        if (!entity) {
            throw new HttpErrors.UnprocessableEntity(`Unable to find entity with id '${id}'`);
        }

        return entity;
    }

    async add(fields?: Partial<T>) {
        this.validate(fields, 'insert');

        const entity = await this.db().create(fields);

        if (!entity) {
            throw new HttpErrors.BadRequest('Unable to create entity');
        }

        return await this.db().save(entity);
    }

    async updateById(id: number|string, fields: Partial<T>) {
        this.validate(fields, 'update');

        const entity = await this.getById(id);

        // ommit changing default values
        delete fields.uuid;
        delete fields.createdAt;
        delete fields.updatedAt;
        
        try {
            await this.db().updateById(id, fields);
        } catch(err) {
            throw new HttpErrors.BadRequest(`Unable to update entity with id '${id}'`);
        }

        return await this.getById(id);
    }

    async deleteById(id: number|string) {
        const entity = await this.getById(id);

        try {
            await this.db().deleteById(id);
        } catch (err) {
            throw new HttpErrors.BadRequest(`Unable to remove entity with id '${id}'`);
        }

        return 'success';
    }
}