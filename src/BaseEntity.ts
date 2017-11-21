import { Entity, Column, VersionColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, AfterInsert, BeforeUpdate, AfterUpdate, BeforeRemove, AfterRemove } from 'typeorm';
import { validate } from 'class-validator';
import * as HttpErrors from 'http-errors';

import { EnvironmentPrimaryColumn } from './decorators/PrimaryColumn';

// ommit setting value through constructor to surpass default value.
const isUnset = (obj: any) => obj === undefined || obj === null;

export abstract class BaseEntity<T> {

    @EnvironmentPrimaryColumn()
    uuid: number|string;

    @VersionColumn()
    version: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    constructor(props?: Partial<T>) {
        this.construct(props);
    }

    private construct<K extends keyof Partial<T>>(props?: Partial<T>) {
        if (props) {
            const copy = Object.assign({}, props);
            Object.keys(copy).filter((key: K) => isUnset(copy[key])).forEach((key: K) => (this[key as string] = copy[key]));
        }
    }
    
    @BeforeInsert()
    private async beforeInsert() {
        const [error] = await validate(this);

        if (!error) {
            return;
        }
        
        throw new HttpErrors.BadRequest(`Unable to create new ${this.constructor.name}. Property '${error.property}' with value '${error.value}' is invalid.`);
    }

    @AfterInsert()
    private afterInsert() { }

    @BeforeUpdate()
    private async beforeUpdate() { 
        console.log('before update')
    }

    @AfterUpdate()
    private afterUpdate() { }

    @BeforeRemove()
    private async beforeRemove() { }

    @AfterRemove()
    private afterRemove() { }
};