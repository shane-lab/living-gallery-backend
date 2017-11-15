const assert = require('assert');
const chai = require('chai');

import * as DependencyInjection from '../build/decorators/DependencyInjection';

@DependencyInjection.Injectable(service => service.injected = true)
class SampleService {

    property = 'default';

    constructor(property, ...data) {
        this.property = property || this.property;
    }
}

class Dependant {

    /** @type {SampleService} */
    @DependencyInjection.Inject(SampleService)
    sampleService;
}

class Dependant2 {

    /** @type {SampleService} */
    @DependencyInjection.Inject(SampleService, 'overloaded')
    sampleService;
}

describe('dependency injection', () => {

    describe('is decoratored as injectable', () => {
        it('should be injectable', done => done(SampleService.injectable ? void 0 : new Error('Injectable is not set')));

        it('should contain a predicate', done => done(SampleService.predicate ? void 0 : new Error('Predicate is not set')));
    });

    describe('inject at decorated class property', () => {
        it('should inject the injectable provider at the decorated property', () => {
            const dependant = new Dependant('default');

            chai.expect(dependant.sampleService).to.be.instanceof(SampleService, 'Injectable provider was not injected');

            chai.assert.isTrue(dependant.sampleService.injected, 'The predicate of the injectable service was not set');

            chai.expect(dependant.sampleService.property).to.equal('default', 'The initial value of \'property\' was not \'default\'');
        });

        it('should inject the injectable provider with overloaded constructor arguments at the decorated property', () => {
            const dependant = new Dependant2();

            chai.expect(dependant.sampleService).to.be.instanceOf(SampleService, 'Injectable provider was not injected');
            
            chai.assert.isTrue(dependant.sampleService.injected, 'The predicate of the injectable service was not set');

            chai.expect(dependant.sampleService.property).to.equal('overloaded', 'The value of \'property\' was not overloaded');
        });
    });

    describe('inject at manual target and property', () => {
        it('should inject the injectable provider at the targeting value', () => {
            const inject = DependencyInjection.Inject(SampleService);

            const target = {};

            let err = null;
            try {
                inject(target, 'service');
            } catch (e) {
                err = e;
            }

            chai.assert.isNull(err, 'Expected injection to pass');

            chai.expect(target.service).to.be.instanceOf(SampleService, 'Injectable provider was not injected');

            chai.assert.isTrue(target.service.injected, 'The predicate of the injectable service was not set');
            
            chai.expect(target.service.property).to.equal('default', 'The initial value of \'property\' was not \'default\'');
        });
        
        it('should inject the injectable provider with overloaded constructor arguments at the targeting value', () => {
            const inject = DependencyInjection.Inject(SampleService, 'overloaded');

            const target = {};

            let err = null;
            try {
                inject(target, 'service');
            } catch (e) {
                err = e;
            }

            chai.assert.isNull(err, 'Expected injection to pass');

            chai.expect(target.service).to.be.instanceOf(SampleService, 'Injectable provider was not injected');

            chai.assert.isTrue(target.service.injected, 'The predicate of the injectable service was not set');
            
            chai.expect(target.service.property).to.equal('overloaded', 'The value of \'property\' was not overloaded');
        });

        it('should not inject anything at the targeting value', () => {
            const inject = DependencyInjection.Inject();

            const target = {};

            let err = null;
            try {
                inject(target, 'service');
            } catch (e) {
                err = e;
            }

            chai.expect(err).to.be.instanceof(Error);

            chai.assert.notExists(target.service);
        });
    });
});