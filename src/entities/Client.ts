import { Entity, Column, JoinColumn, ManyToOne, BeforeInsert } from 'typeorm';

import { BaseEntity } from '../BaseEntity';

@Entity()
export class Client extends BaseEntity<Client> {
    
    @ManyToOne(type => Client, client => client.neighbors, {
        cascadeUpdate: true
    })
    neighbors: Client[];

    @BeforeInsert()
    private beforeInsert(object: object, propertyName: string) {
        console.log('before insert:')
        console.log(object);
        console.log(propertyName);
    }
};