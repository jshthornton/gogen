var Gogen = require('../index.js');
var Q = require('q');
var chai = require('chai');
var sinon = require('sinon');

var expect = chai.expect;

describe('Gogen', function() {
  describe('#_shouldRetry', function() {
    var gogen;
    var defStub;
    
    beforeEach(function() {
      gogen = new Gogen(function() {}, function() {}, {});
      defStub = sinon.stub(gogen._deferred.promise, 'inspect');
    });

    context('When fulfilled', function() {
      it('Should be false', function() {
        defStub.returns({ state: 'fulfilled', value: true });
        var res = gogen._shouldRetry();
        expect(res).to.equal(false);
      });

    });

    context('When pending', function() {
      it('Should be true', function() {
        defStub.returns({ state: 'pending' });
        var res = gogen._shouldRetry();
        expect(res).to.equal(true);
      });
    });

    context('When rejected', function() {
      it('Should be false', function() {
        defStub.returns({ state: 'rejected', value: true });
        var res = gogen._shouldRetry();
        expect(res).to.equal(false);
      });
    });

    

  });
});