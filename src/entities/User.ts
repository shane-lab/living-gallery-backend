import { Entity, Column } from 'typeorm';
import { IsEmail } from 'class-validator';
import * as cuid from 'cuid';

import { BaseEntity } from '../BaseEntity';

@Entity()
export class User extends BaseEntity<User> {

    @Column({
        unique: true
    })
    @IsEmail()
    email: string;

    @Column({
        default: cuid()
    })
    password: string;
};