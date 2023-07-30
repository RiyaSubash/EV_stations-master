function ChargingAvailabilityOptions(options) {
    this.options = options;
  }
  
  ChargingAvailabilityOptions.prototype.go = function() {
    const options = this.options;
  
    return new Promise(function(fulfill, reject) {
      if (!hasOwnProperties(options, [ 'chargingAvailability', 'key' ])) {
        reject('chargingAvailability call is missing required properties.');
        return;
      }
  
      fetchResponse(formatUrl(options), fulfill, reject);
    });
  
    function fetchResponse(url, fulfill, reject) {
      fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(function(response) {
        parseResponse(response, fulfill, reject);
      })
      .catch(function(error) {
        reject(error);
      });
    }
  
    function formatUrl(options) {
      return 'https://api.tomtom.com/search/2/chargingAvailability.json?' +
        'chargingAvailability=' +  encodeURIComponent(options.chargingAvailability) + '&' +
        'key=' + encodeURIComponent(options.key);
    }
  
    function hasOwnProperties(options, properties) {
      if (options == null)
        return false;
  
      for(const property of properties)
        if (!options.hasOwnProperty(property))
          return false;
  
      return true;
    }
  
    function parseResponse(response, fulfill, reject) {
      response
        .json()
        .then(function(obj) {
          if (!obj.hasOwnProperty('error'))
            fulfill(obj);
          else
            reject(obj.error.description);
        })
        .catch(function(error) {
          reject(error);
        });
    }
  }
  
  function chargingAvailability(options) {
    return new ChargingAvailabilityOptions(options);
  }