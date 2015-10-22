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

  describe('#_evaluateCondition', function() {
    var gogen;
    var conditionStub;
    
    beforeEach(function() {
      conditionStub = sinon.stub();
      gogen = new Gogen(function() {}, conditionStub, {});
    });

    context('When condition is true', function() {
      it('Should resolve', function() {
        conditionStub.returns(true);
        var defSpy = sinon.spy(gogen._deferred, 'resolve');
        gogen._evaluateCondition({});

        expect(defSpy.called).to.equal(true);
      });
    });

    context('When condition throws', function() {
      it('Should reject', function() {
        conditionStub.throws();
        var defSpy = sinon.spy(gogen._deferred, 'reject');
        gogen._evaluateCondition({});

        expect(defSpy.called).to.equal(true);
      });
    });

    context('When condition is false', function() {
      it('Should notify', function() {
        conditionStub.returns(false);
        var defSpy = sinon.spy(gogen._deferred, 'notify');
        gogen._evaluateCondition({});

        expect(defSpy.called).to.equal(true);
      });
    });
  });

  describe('#_perform', function() {

  });

  describe('#_poll', function() {
    var gogen;

    context('When should retry is true', function() {
      it('Should repoll', function(done) {
        gogen = new Gogen(function() {}, function() {}, {});
        var performStub = sinon.stub(gogen, '_perform');
        var shouldRetryStub = sinon.stub(gogen, '_shouldRetry');
        var repollStub = sinon.stub(gogen, '_repoll');

        var def = Q.defer();
        def.resolve();
        performStub.returns(def.promise);

        shouldRetryStub.returns(true);

        gogen._poll().then(function() {
          expect(repollStub.called).to.equal(true);
        }).then(done, done);
      });
    });

    context('When should retry is false', function() {
      it('Should not repoll', function(done) {
        gogen = new Gogen(function() {}, function() {}, {});
        var performStub = sinon.stub(gogen, '_perform');
        var shouldRetryStub = sinon.stub(gogen, '_shouldRetry');
        var repollStub = sinon.stub(gogen, '_repoll');

        var def = Q.defer();
        def.resolve();
        performStub.returns(def.promise);

        shouldRetryStub.returns(false);

        gogen._poll().then(function() {
          expect(repollStub.called).to.equal(false);
        }).then(done, done);
      });
    });
  });
});