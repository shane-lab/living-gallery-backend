import { Entity, Column } from 'typeorm';

import { BaseEntity } from '../BaseEntity';

@Entity()
export class Behaviour extends BaseEntity<Behaviour> {
    
    @Column({
        unique: true
    })
    type: String;
};