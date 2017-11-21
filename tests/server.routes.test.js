import * as supertest from 'supertest';

const assert = require('assert');
const chai = require('chai');

const { getApp } = require('../build');

describe('routes', () => {

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

    const statusOK = (res) => chai.expect(res.statusCode, 'status code is not OK').to.match(/^2[0-9]{2}$/);

    describe('when GET /', () => {
        it('should catch 404', done => {
            request
                .get('/')
                .expect(404)
                .end(done);
        });
    });

    describe('when GET /api', () => {
        it('should return 200+', done => {
            request
                .get('/api')
                .expect(statusOK)
                .end(done);
        });
    });
    
    describe('when GET /auth', () => {
        it('should redirect to /auth/login with statuscode 302', done => {
            request
                .get('/auth')
                .expect(302)
                .expect('Location', '/auth/login')
                .end(done);
        });
    });

    describe('when GET /login', () => {
        it('should use alias \'/login\' to redirect to /auth/login with statuscode 302', done => {
            request
                .get('/login')
                .expect(302)
                .expect('Location', '/auth/login')
                .end(done);
        });
    });
    
    describe('when GET /register', () => {
        it('should use alias \'/register\' to redirect to /auth/register with statuscode 302', done => {
            request
                .get('/register')
                .expect(302)
                .expect('Location', '/auth/register')
                .end(done);
        });
    });

    after(async () => {
        await db.close();

        return void 0;
    });
});