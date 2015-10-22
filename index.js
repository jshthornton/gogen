var Q = require('q');

var Cls = function(operation, condition, options) {
  this._operation = operation;
  this._condition = condition;
  this._options = options;
  this._deferred = Q.defer();
};

Cls.prototype.start = function() {
  this._poll();
  return this._deferred.promise;
};

Cls.prototype._poll = function() {
  this._perform().then(function() {
    if(this._shouldRetry() === false) {
      return;
    }

    // Exit the current stack
    setTimeout(function() {
      this._poll();
    }.bind(this), 0);
  }.bind(this));
};

Cls.prototype._perform = function() {
  return this._operation().then(this._evaluateCondition.bind(this));
};

Cls.prototype._shouldRetry = function() {
  var state = this._deferred.promise.inspect().state;

  switch(state) {
    case 'pending':
      return true;
    case 'fulfilled':
    case 'rejected':
      return false;
    default:
      throw new Error('Unsupported promise state: ' + state);
  }
};

Cls.prototype._evaluateCondition = function(data) {
  try {
    var result = this._condition(data);
    if(result === true) {
      this._deferred.resolve(data);
    } else {
      this._deferred.notify(data);
    }
  } catch (ex) {
    this._deferred.reject(ex);
  }
};

module.exports = Cls;