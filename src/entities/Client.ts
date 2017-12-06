import { Entity, Column, JoinColumn, OneToMany, ManyToMany } from 'typeorm';

import { BaseEntity } from '../BaseEntity';
import { Creature } from './Creature';

@Entity()
export class Client extends BaseEntity<Client> {
    
    @ManyToMany(type => Client, client => client.neighbors, {
        cascadeUpdate: true
    })
    neighbors: Client[];

    @OneToMany(type => Creature, creature => creature.client)
    creatures: Creature[];
};