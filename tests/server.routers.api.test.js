import * as supertest from 'supertest';
import * as typeorm from 'typeorm';

const assert = require('assert');
const chai = require('chai');

const { getApp } = require('../build');
const { Client, User } = require('../build/entities');

describe('API Router (/api/${route}/${...args})', () => {

    /** @type {supertest.SuperTest<supertest.Test>} */
    let request;

    /** @type {typeorm.Connection} */
    let db;

    before(done => {
        getApp()
            .then(app => (db = app.context.db, supertest.agent(app.callback())))
            .then(req => (request = req, done()))
            .catch(done);
    });

    const contentType = 'application/json; charset=utf-8';

    describe('when GET /api/clients', () => {
        before(async () => {
            const clientRepo = db.getRepository(Client);

            await clientRepo.clear();

            const u = undefined;

            const clients = await clientRepo.create([u, u, u, u]);

            let count = await clientRepo.count();

            chai.assert.equal(count, 0);

            await clientRepo.save(clients);

            count = await clientRepo.count();

            chai.assert.equal(count, 4);

            return void 0;
        });

        it('should return an array of Clients', done => {
            request
                .get('/api/clients')
                .expect('Content-type', contentType)
                .expect(res => {
                    chai.expect(res.body.data).to.exist;

                    /** @type {Client[]} */
                    const data = res.body.data;

                    chai.expect(data).to.be.instanceOf(Array);

                    chai.assert.equal(data.length, 4)
                })
                .end(done);
        });

        it('should return an empty array when Client repository is empty', done => {
            const clientRepo = db.getRepository(Client);
            
            clientRepo.clear()
                .then(() => {
                    request
                        .get('/api/clients')
                        .expect('Content-type', contentType)
                        .expect(res => {
                            chai.expect(res.body.data).to.exist;
        
                            /** @type {[]} */
                            const data = res.body.data;
        
                            chai.expect(data).to.be.instanceof(Array)
        
                            chai.assert.equal(data.length, 0);
                        })
                        .end(done);
                    })
                .catch(done);
        });
    });

    describe('when POST /api/clients', () => {
        it('should create a new Client when sending empty body', done => {
            request
                .post('/api/clients')
                // .send({})
                .expect('Content-type', contentType)
                .expect(res => {
                    chai.expect(res.body.data).to.exist;
                    
                    /** @type {Client} */
                    const data = res.body.data;

                    chai.expect(data).to.have.property('uuid');
                    
                    chai.expect(data).to.have.property('version', 1);

                    chai.expect(data).to.have.property('createdAt');

                    chai.expect(data).to.have.property('updatedAt');
                })
                .end(done);
        });
    });

    describe('when GET /api/clients/:id', () => {
        it('should return an existing Client', done => {
            const clientRepo = db.getRepository(Client);

            const client = clientRepo.create({});

            clientRepo.save(client)
                .then(saved => {
                    chai.expect(saved).to.exist;

                    chai.expect(saved).to.have.property('uuid');

                    request
                        .get(`/api/clients/${saved.uuid}`)
                        .expect('Content-type', contentType)
                        .expect(res => {
                            chai.expect(res.body.data).to.exist;

                            /** @type {Client} */
                            const data = res.body.data;
                            
                            chai.expect(data).to.have.property('uuid');

                            chai.assert.equal(data.uuid, saved.uuid);
                        })
                        .expect(200)
                        .end(done);
                })
                .catch(done);
        });

        it('should not find a Client with non-existing id and result in statuscode 422', done => {
            request
                .get('/api/clients/1')
                .expect('Content-type', contentType)
                .expect(422)
                .end(done);
        });
    });

    describe('when PUT /api/clients/:id', () => {
        
        /** @type {Client} */
        let savedClient;

        beforeEach(async () => {
            savedClient = undefined;

            const clientRepo = db.getRepository(Client);

            const client = clientRepo.create({});

            /** @type {Client} */
            const saved = await clientRepo.save(client);
            
            chai.expect(saved).to.exist;
            
            chai.expect(saved).to.have.property('uuid');

            savedClient = client;
            
            return void 0;
        });

        it('should NOT update an existing Client when requesting without a body and result in statuscode 400', done => {
            request
                .put(`/api/clients/${savedClient.uuid}`)
                .expect('Content-type', contentType)
                .expect(400)
                .end(done);
        });

        it('should NOT update an existing Client when requesting with an empty body and result in statuscode 400', done => {
            request
                .put(`/api/clients/${savedClient.uuid}`)
                .send({})
                .expect('Content-type', contentType)
                .expect(400)
                .end(done);
        });

        it('should NOT update when pushing non-existing fields in an existing Client and result in statuscode 400', done => {
            request
                .put(`/api/clients/${savedClient.uuid}`)
                .send({ versione: 999 })
                .expect('Content-type', contentType)
                .expect(400)
                .end(done);
        });

        it('should NOT be able to update the uuid in an existing Client and result in statuscode 400', done => {
            request
                .put(`/api/clients/${savedClient.uuid}`)
                .send({ uuid: 999 })
                .expect('Content-type', contentType)
                .expect(400)
                .end(done);
        });

        it('should not find a Client with non-existing id and result in statuscode 422', done => {
            request
                .put('/api/clients/1')
                .expect('Content-type', contentType)
                .expect(422)
                .end(done);
        })
    });

    describe('when DELETE /api/clients/:id', () => {
        it('should not be able to delete non-existing Client and result in statuscode 422', done => {
            request
                .get('/api/clients/1')
                .expect('Content-type', contentType)
                .expect(422)
                .end(done);
        });
    });

    // describe('when GET /api/auth', () => {
    //     it('should ', done => {
    //         request
    //             .get('/api/')
    //             .expect('Content-type', contentType)
    //             .end(done);
    //     });
    // });

    describe('when GET /api/users', () => {
        before(async () => {
            const userRepo = db.getRepository(User);

            await userRepo.clear();

            const users = await userRepo.create([{email: 'email@domain.com'}]);

            let count = await userRepo.count();

            chai.assert.equal(count, 0);

            await userRepo.save(users);

            count = await userRepo.count();

            chai.assert.equal(count, 1);

            return void 0;
        });

        
        it('should return an array of Users', done => {
            request
                .get('/api/users')
                .expect('Content-type', contentType)
                .expect(res => {
                    chai.expect(res.body.data).to.exist;

                    /** @type {User[]} */
                    const data = res.body.data;

                    chai.expect(data).to.be.instanceOf(Array);

                    chai.assert.equal(data.length, 1)
                })
                .end(done);
        });

        it('should return an empty array when User repository is empty', done => {
            const userRepo = db.getRepository(User);
            
            userRepo.clear()
                .then(() => {
                    request
                        .get('/api/users')
                        .expect('Content-type', contentType)
                        .expect(res => {
                            chai.expect(res.body.data).to.exist;
        
                            /** @type {[]} */
                            const data = res.body.data;
        
                            chai.expect(data).to.be.instanceof(Array)
        
                            chai.assert.equal(data.length, 0);
                        })
                        .end(done);
                    })
                .catch(done);
        });
    });

    describe('when GET /api/user/:id', () => {
        it('should return an existing User', done => {
            const userRepo = db.getRepository(User);

            const user = userRepo.create({email: 'email@domain.com'});

            userRepo.save(user)
                .then(saved => {
                    chai.expect(saved).to.exist;

                    chai.expect(saved).to.have.property('uuid');

                    request
                        .get(`/api/users/${saved.uuid}`)
                        .expect('Content-type', contentType)
                        .expect(res => {
                            chai.expect(res.body.data).to.exist;

                            /** @type {User} */
                            const data = res.body.data;
                            
                            chai.expect(data).to.have.property('uuid');

                            chai.assert.equal(data.uuid, saved.uuid);
                        })
                        .expect(200)
                        .end(done);
                })
                .catch(done);
        });

        it('should not find an User with non-existing id and result in statuscode 422', done => {
            request
                .get('/api/users/1')
                .expect('Content-type', contentType)
                .expect(422)
                .end(done);
        });
    });

    describe('when PUT /api/users/:id', () => {
        
        /** @type {User} */
        let savedUser;

        beforeEach(async () => {
            savedUser = undefined;

            const userRepo = db.getRepository(User);

            const user = userRepo.create({email: 'email@domain.com'});

            /** @type {User} */
            const saved = await userRepo.save(user);
            
            chai.expect(saved).to.exist;
            
            chai.expect(saved).to.have.property('uuid');

            savedUser = user;
            
            return void 0;
        });

        it('should update the addressed fields in the body of the request of an existing User', done => {
            request
                .put(`/api/users/${savedUser.uuid}`)
                .send({email: 'email@alternative.com'})
                .expect(res => {
                    chai.expect(res.body.data).to.exist;

                    /** @type {User} */
                    const data = res.body.data;

                    chai.assert.notEqual(data.email, savedUser.email);

                    chai.assert.equal(data.email, 'email@alternative.com');
                })
                .expect(200)
                .end(done);
        });

        it('should NOT update an existing User when requesting without a body and result in statuscode 400', done => {
            request
                .put(`/api/users/${savedUser.uuid}`)
                .expect('Content-type', contentType)
                .expect(400)
                .end(done);
        });

        it('should NOT update an existing User when requesting with an empty body and result in statuscode 400', done => {
            request
                .put(`/api/users/${savedUser.uuid}`)
                .send({})
                .expect('Content-type', contentType)
                .expect(400)
                .end(done);
        });

        it('should NOT update when pushing non-existing fields in an existing User and result in statuscode 400', done => {
            request
                .put(`/api/users/${savedUser.uuid}`)
                .send({ versione: 999 })
                .expect('Content-type', contentType)
                .expect(400)
                .end(done);
        });

        it('should NOT be able to update the uuid in an existing User and result in statuscode 400', done => {
            request
                .put(`/api/users/${savedUser.uuid}`)
                .send({ uuid: 999, something: 'any' })
                .expect('Content-type', contentType)
                .expect(400)
                .end(done);
        });

        it('should not find an User with non-existing id and result in statuscode 422', done => {
            request
                .put('/api/users/1')
                .expect('Content-type', contentType)
                .expect(422)
                .end(done);
        })
    });

    describe('when DELETE /api/users/:id', () => {
        it('should not be able to delete non-existing User and result in statuscode 422', done => {
            request
                .get('/api/users/1')
                .expect('Content-type', contentType)
                .expect(422)
                .end(done);
        });
    });
    
    afterEach(async () => {
        const clientRepo = db.getRepository(Client);

        await clientRepo.clear();

        const userRepo = db.getRepository(User);

        await userRepo.clear();

        return void 0;
    });

    after(async () => {
        await db.close();

        return void 0;
    });
});