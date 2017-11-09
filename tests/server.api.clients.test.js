const assert = require('assert');
const chai = require('chai');

const { createConnection, getManager } = require('typeorm');

const app = require('../build');
const request = require('supertest').agent(app.callback());

const { Client } = require('../build/orm/entities/');

describe('client api', () => {

    before('installing typeorm', done => {
        createConnection()
            .then(connection => (app.context.db = connection, done()))
            .catch(err => done(err));
    });

    describe('route api/clients', () => {
        const route = '/api/clients';

        // beforeEeach(done => (getManager().clear(Client).then(done), void 0))

        beforeEach(async done => {
            // try {
            //     const repo = await getManager().getRepository(Client);
                
            //     // // clear from previous connection
            //     // await repo.clear();

            //     // // insert test client
            //     // const client1 = new Client();
                
            //     // await repo.save(client1);
                
            //     // done();
            // } catch (err) {
            //     done(err);
                
            //     return void 0;
            // }
            done();

            return void 0
        });

        describe('when GET /api/clients', () => {
            it ('should return a list of entities in the repository', done => {
                request
                    .get(route)
                    .expect(200)
                    .expect(res => {
                        assert.equal(res.body.data.length, 1)
                        const [first] = res.body.data;
                        
                        chai.expect(first, 'expecting first argument of clients to exist').to.exist;

                        // assert.equal()
                    })
                    .end(done);
            });
        });

        describe('when POST /api/clients', () => {
            it('should NOT insert a new document in the repository', done => {
                request
                    .post(route)
                    .send({ neighbors: [0x7740, 0x9952, 0x499fa] })
                    .expect(200)
                    .end(done);
                // done();
            });

            it('should insert a new document in the repository', done => {
                done();
            });

            it('should insert a series of new documents in the repository', done => {
                done();
            });
        })
    });

    after('close typeorm', done => {
        const { db } = app.context;
        if (!db || !db.isConnected) {
            return done();
        }
        db.close().then(done);
    })
});