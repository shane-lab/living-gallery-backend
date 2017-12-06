import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../BaseEntity';
import { Client } from './Client';
import { Behaviour } from './Behavior';

@Entity()
export class Creature extends BaseEntity<Creature> {
    
    @ManyToOne(type => Client, client => client.neighbors, {
        cascadeUpdate: true
    })
    client: Client;
    
    @JoinColumn({
        name: 'behaviours',
        referencedColumnName: 'behaviour'
    })
    behaviours: Behaviour[] = [];
};