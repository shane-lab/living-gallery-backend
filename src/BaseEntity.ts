import { Entity, Column, VersionColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, AfterInsert, BeforeRemove, AfterUpdate, AfterRemove } from 'typeorm';
import * as chalk from 'chalk';

import { EnvironmentPrimaryColumn } from './decorators/PrimaryColumn';

// ommit setting value through constructor to surpass default value.
const isUnset = (obj: any) => obj === undefined || obj === null;

const print = (obj: Object, message?: string) => (message ? console.log(chalk.default`--{blue ${message}}--`) : void 0, Object.entries(obj).forEach(([key, value]) => console.log(chalk.default`{green ${key}}: {red ${value}}`)));

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
    private beforeInsert() {
        print(this, 'before insert');
    }

    @AfterInsert()
    private afterInsert() {
        print(this, 'after insert');
    }

    @BeforeRemove()
    private beforeRemove() {
        print(this, 'before remove');
    }

    @AfterRemove()
    private afterRemove() {
        print(this, 'after remove');
    }
};