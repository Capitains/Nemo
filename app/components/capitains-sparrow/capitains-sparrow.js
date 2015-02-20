angular.module('capitainsSparrow.models', [])
  .factory('Repository', ['$q', function($q) {
    //We create a repo
    var CTSrepo =  function(endpoint, version) { 
      this.load = function() {
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
      };
      this.Repository = new CTS.repository.repository(endpoint, 3),
      this.indexing = function(callback) {
        var $this = this,
            HierarchicalIndex = {},
            FulltextIndex = [];
        angular.forEach(this.Repository.inventories, function(inventory, inventoryName) {
          var textgroups = inventory.getRaw();
          // Works : Works
          // Textgroup : Author Name
          angular.forEach(textgroups, function(works, textgroup) {
            HierarchicalIndex[textgroup] = HierarchicalIndex[textgroup] || {display : textgroup, children : {}};
            // Types : Type of text and texts
            // Work : Title of Work
            angular.forEach(works, function(types, work) {
              HierarchicalIndex[textgroup].children[work] = HierarchicalIndex[textgroup].children[work] || {display : work, author : textgroup, children : {}};
              //We erase types
              var editions = {}
              // Text : the text Object
              // Work : the title of Work
              angular.forEach(types, function(text, type) {
                angular.forEach(text, function(object, title) {
                  //We enhance the text informations
                  object.inventory = inventory.identifier;
                  object.author    = textgroup;
                  object.title     = work;
                  object.display   = "("+ inventoryName + " ) " + object.getTitle();
                  object.start     = object.citations.map(function(val) { return ""; });
                  object.end       = object.citations.map(function(val) { return ""; });
                  HierarchicalIndex[textgroup].children[work].children[object.urn] = object;
                  var tempTitle = [inventoryName, textgroup, work, title].join(", ")
                  FulltextIndex.push(object);
                });
              });
            });
          })
        });
        callback.call($this, HierarchicalIndex, FulltextIndex)
      }
    }
    return CTSrepo;
  }])
  .factory('Passage', ['$q', function($q) {
    return function(urn, endpoint, inventory, text) {
      this.Passage = new CTS.text.Passage(urn, endpoint, inventory);
      this.Passage.source = text;
      this.load = function() {
        var deferred = $q.defer(),
            $this = this;
        this.Passage.retrieve({
          success : function() {
              $this.Passage.body = $this.Passage.getXml("body", "string");
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
  }]);