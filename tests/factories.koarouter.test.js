import 'promisify-supertest';
import * as supertest from 'supertest';

const assert = require('assert');
const chai = require('chai');

const Koa = require('koa');
const KoaRouter = require('koa-router');

import * as Router from '../build/decorators/Router';
import { KoaRouterFactory } from '../build/factories/KoaRouterFactory';

@Router.InjectableRouter({
    prefix: 'test'
})
class RouterBasic { }

@Router.InjectableRouter({
    prefix: 'test1',
    skipDefaultRoute: true
})
class RouterWithoutIndex { }

@Router.InjectableRouter()
class RouterWithoutPrefix { }

@Router.InjectableRouter({
    aliases: [{
        name: 'alias',
        destination: '/'
    }]
})
class RouterWithAlias { }

@Router.InjectableRouter({
    redirects: [{
        path: '/',
        destination: '/test'
    }]
})
class RouterWithRedirect { 

    @Router.Route('/test')
    testAction() {
        return 'test action';
    }
}

describe('KoaRouter factory method', () => {

    const routers = [RouterBasic, RouterWithoutIndex, RouterWithoutPrefix, RouterWithAlias, RouterWithRedirect]

    describe('is decorated as injectable router', () => {
        it('should be injectable', done => {
            const unDecorated = routers.filter(decorated => !decorated.injectable);
            
            done(unDecorated.length > 0 ? new Error(`The class ${unDecorated[0].name} was not properly decorated as injectable router`) : void 0)
        });
    });

    describe('create router from factory method', () => {
        it('should create a new KoaRouter from \'RouterBasic\' with prefix \'test\' and default route', done => {
            const { router } = KoaRouterFactory(RouterBasic);

            chai.expect(router).to.exist;

            chai.expect(router).to.be.an.instanceOf(KoaRouter);

            done();
        });

        it('should create a new KoaRouter from \'RouterBasic\' with prefix \'overloaded\' and default route', done => {
            const { router } = KoaRouterFactory(RouterBasic, 'overloaded');

            chai.expect(router).to.exist;

            chai.expect(router).to.be.an.instanceOf(KoaRouter);

            done();
        });
    });

    describe('invoke router from factory method in KoaJS app', () => {
        
        /** @type {supertest.SuperTest<supertest.Test>} */
        let request;

        /** @type {Koa} */
        let app;
        
        /** @type {boolean} */
        let invoked;
        
        /** @type {string} */
        let customPrefix;
        
        let index = 0;

        const useRouter = router => app.use(router.routes()).use(router.allowedMethods());
        
        beforeEach(async () => {
            invoked = true;
            
            app = new Koa();

            try {
                const { router, aliasedRouters } = KoaRouterFactory(routers[index], customPrefix);
    
                useRouter(router);
    
                if (aliasedRouters && aliasedRouters.length) {
                    aliasedRouters.forEach(useRouter);
                }
    
                request = await supertest.agent(app.callback());
            } catch (e) {
                invoked = false;
            }

            customPrefix = undefined;

            index++;
        });

        const routerName = i => routers[i || (index - 1)].name;

        const notInvoked = done => done(invoked ? new Error(`${routerName()} was invoked`) : void 0);

        it('should invoke RouterBasic as router', done => {
            assert.equal(invoked, true);

            assert.equal('RouterBasic', routerName());

            request
                .get('/test/')
                .expect(200)
                .end(done);
        });
        
        it('should invoke RouterWithoutIndex as router without routes and default route', done => {
            assert.equal(invoked, true);
            
            assert.equal('RouterWithoutIndex', routerName());

            request
                .get('/test1/')
                .expect(404)
                .end(done);
        });
        
        it('should NOT invoke RouterWithoutPrefix as router', notInvoked);

        it('should invoke RouterWithoutPrefix as router with overloaded prefix and default route', done => {
            assert.equal(invoked, true);

            assert.equal('RouterWithoutPrefix', routerName());

            request
                .get(`/${routerName()}`)
                .expect(200)
                .end(done);
        });
        
        it('should NOT invoke RouterWithAlias as router', notInvoked);

        it('should invoke RouterWithoutAlias as router with overloaded prefix, default route and aliased route with statuscode 302', done => {
            assert.equal(invoked, true);

            assert.equal('RouterWithAlias', routerName());

            request
                .get(`/${routerName()}`)
                .expect(200)
                .end()
                .then(() => request.get('/alias'))
                .then(res => {
                    chai.expect(res.body).to.exist;

                    assert.equal(res.status, 302);
                    
                    done();
                })
                .catch(done);
        });

        it('should NOT invoke RouterWithRedirect as router', notInvoked);
        
        it('should invoke RouterWithRedirect as router with overloaded prefix and redirect from default route to redirected route', done => {
            assert.equal(invoked, true);

            assert.equal('RouterWithRedirect', routerName());

            request
                .get(`/${routerName()}`)
                .expect(302)
                .expect('Location', `/${routerName().toLowerCase()}/test`)
                .end(done);
        });

        afterEach(done => {
            if (!invoked) {
                customPrefix = routerName().toLowerCase();
                index--;
            }

            done();
        });
    });
});