angular.module('capitainsSparrow.models', [])
  .factory('Repository', ['$q', function($q) {
    //We create a repo
    var CTSrepo =  function(endpoint, version) { 
      return {
        load : function() {
          var deferred = $q.defer();
          this.Repository.load(
              function() {
                deferred.resolve();
              },
              function(error) {
                deferred.reject("An error occured while fetching items");
              }
          );
          return deferred.promise;
        },
        Repository : new CTS.repository.repository(endpoint, 3)
      }
    }
    return CTSrepo;
  }])
  .factory('Passage', ['$q', function($q) {
    return function(urn, endpoint, inventory) {
      return {
        Passage : new CTS.text.Passage(urn, endpoint, inventory),
        load : function() {
          var deferred = $q.defer();
          this.Passage.retrieve({
            success : function() {
                deferred.resolve();
              },
            error : function(error) {
                deferred.reject("An error occured while fetching items");
              }
            }
          );
          return deferred.promise;
        }
      }
    }
  }]);