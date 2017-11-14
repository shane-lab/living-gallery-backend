const assert = require('assert');
const chai = require('chai');

import * as DependencyInjection from '../build/decorators/DependencyInjection';

// @DependencyInjection.Injectable(service => service.injected = true)
class SampleService {
    constructor(...data) {
        // (data || []).forEach()
    }
}

class Dependant {
    // @DependencyInjection.Inject(SampleService)
    sampleService;
}

describe('dependency injection', () => {

    describe('is decoratored as injectable', () => {
        it('should be injectable', done => done(SampleService.injectable ? void 0 : new Error('Injectable is not set')));

        it('should contain a predicate', done => done(SampleService.predicate ? void 0 : new Error('Predicate is not set')))
    });
});