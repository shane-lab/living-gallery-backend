import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../BaseEntity';

@Entity()
export class Client extends BaseEntity<Client> {
    
    // @ManyToOne(type => Client, client => client.neighbors, {
    //     cascadeUpdate: true
    // })
    // neighbors: Client[];
};