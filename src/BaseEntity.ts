import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

declare type Props<T> = {[K in keyof T]?: T[K]};

// ommit setting value through constructor to surpass default value.
const isUnset = (obj: any) => obj === undefined || obj === null;

export abstract class BaseEntity<T> {

    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    uuid: number

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    constructor(props?: Props<T>) {
        if (props) {
            const copy = Object.assign({}, props) as any;
            Object.keys(copy).filter(key => isUnset(copy[key])).forEach(key => (this[key as string] = copy[key]));
        }
    }
};
// @todo, resolve secondary generic type. its filled but somehow requires a type anyway?
// export abstract class BaseEntity<T, K extends keyof Props<T>> {

//     @PrimaryGeneratedColumn('uuid', { name: 'id' })
//     uuid: number

//     @CreateDateColumn({ name: 'created_at' })
//     createdAt: Date;

//     @UpdateDateColumn({ name: 'updated_at' })
//     updatedAt: Date;

//     constructor(props?: Props<T>) {
//         if (props) {
//             const copy = Object.assign({}, props);
//             Object.keys(copy).filter((key: K) => unset(copy[key])).forEach((key: K) => (this[key as string] = copy[key]));
//         }
//     }
// };