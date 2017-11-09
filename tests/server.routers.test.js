import * as supertest from 'supertest';

const assert = require('assert');
const chai = require('chai');

const { getApp } = require('../build');

describe('routers', () => {

    /** @type {supertest.SuperTest<supertest.Test>} */
    let request;

    before(done => {
        getApp()
            .then(app => supertest.agent(app.callback()))
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
});