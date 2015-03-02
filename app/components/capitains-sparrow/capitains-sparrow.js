angular.module('capitainsSparrow.models', [])
  .factory('Repository', ['$q', '$route', 'localStorageService', function($q, $route, localStorageService) {
    //We create a repo
    var CTSrepo =  function(endpoint, version) { 
      var self = this;
      this.load = function() {
        var deferred = $q.defer();

        if(localStorageService.get("inventories")) {
          self.Repository.fromObject(localStorageService.get("inventories"));
          deferred.resolve();
        } else {
          self.Repository.load(
              function() {
                localStorageService.set("inventories", self.Repository.inventories);
                deferred.resolve();
              },
              function(error) {
                deferred.reject("An error occured while fetching items");
              }
          );
        }
        return deferred.promise;
      };
      this.Repository = new CTS.repository.repository(endpoint, 3)

      this.find = function (urn) {
        var index = localStorageService.get("index-urn");
        var textUrn = urn.split(':').slice(0,4).join(":");
        var deferred = $q.defer();

        if(typeof index[textUrn] !== "undefined") {
          deferred.resolve(index[textUrn]);
        } else {
          deferred.reject();
        }
        return deferred.promise;
      }
      this.indexing = function(callback) {
        var HierarchicalIndex = {},
            FulltextIndex = [],
            URNIndex = {};
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
                  object.fulltext = tempTitle;
                  FulltextIndex.push(object);
                  URNIndex[object.urn] = object;
                });
              });
            });
          })
        });
        self.urnIndex = URNIndex;
        localStorageService.set("index-urn", URNIndex);
        callback.call(self, HierarchicalIndex, FulltextIndex)
      }
    }
    return CTSrepo;
  }])
  .factory('Passage', ['$q', '$location', function($q, $location) {
    return function(urn, endpoint, inventory, text) {
      this.text = text;
      this.urn = urn;

      this.splitURN = function(urn) {
        var surn = urn.split(":");
        if(surn.length === 5) {
          this.urn = surn.slice(0,4).join(":")
          var refs = surn[4].split("-");
          this.text.start = refs[0].split(".");
          this.text.end   = (refs.length === 2) ? refs[1].split(".") : [];
        }
      }

      this.splitURN(urn)

      if(typeof window.texts === "undefined") {
        window.texts = {};
      }
      if(typeof window.texts[this.urn] === "undefined") {
        window.texts[this.urn] = new CTS.text.Text(
          urn,
          endpoint,
          inventory
        );
      }

      var passage = window.texts[this.urn].makePassageUrn(text.start, text.end);
      this.passage = passage;

      if(typeof window.texts[this.urn].passages[this.passage] === "undefined" && text.start && text.end) {
        window.texts[this.urn].getPassage(text.start, text.end);
      }

      var createPassage = function() {
        window.texts[this.urn].passages[this.passage].source = this.text;
        window.texts[this.urn].passages[this.passage].next = false;
        window.texts[this.urn].passages[this.passage].prev = false;
        this.Passage = window.texts[this.urn].passages[this.passage]
      }

      if(typeof window.texts[this.urn].passages[this.passage].source === "undefined"){
        createPassage.call(this);
      } else {
        this.Passage = window.texts[this.urn].passages[this.passage]
      }

      this.updatePassage = function() {
        var self = this;
        $location.search("urn", window.texts[self.urn].passages[self.passage].urn);
        window.texts[self.urn].passages[self.passage].body = window.texts[self.urn].passages[self.passage].getXml("body", "string");
        window.texts[self.urn].passages[self.passage].next = (function() { 
          var next = window.texts[self.urn].passages[self.passage].getXml("next");
          if(next.length === 1 && next[0].textContent !== "") { return next[0].textContent; }
          else { return false; }
        })()
        window.texts[self.urn].passages[self.passage].notes = {};
        [].forEach.call(window.texts[self.urn].passages[self.passage].getXml("note"), function(node) {
          window.texts[self.urn].passages[self.passage].notes[Object.keys(window.texts[self.urn].passages[self.passage].notes).length] = {
            html      : node.innerHTML,
            id        : Object.keys(window.texts[self.urn].passages[self.passage].notes).length,
            focus     : false
          };
        });
        self.Passage = window.texts[self.urn].passages[self.passage];
        /**
        For now, broken in the API
        $self.Passage.prev = (function() { 
          var prev = $self.Passage.getXml("prev");
          if(prev.length === 1 && prev[0].textContent !== "") { return prev[0].textContent; }
          else { return false; }
        })()
        */

      }

      this.load = function() {
        var deferred = $q.defer(),
            self = this;
        if(window.texts[this.urn].passages[this.passage].body) {
          (function () {
            self.Passage = window.texts[self.urn].passages[self.passage];
            deferred.resolve();
          })()
          return deferred.promise;
        }
        window.texts[this.urn].passages[this.passage].retrieve({
          success : function() {
              self.updatePassage.call(self);
              deferred.resolve();
            },
          error : function(error) {
              deferred.reject("An error occured while fetching items");
            }
          }
        );
        return deferred.promise;
      }

      this.firstPassage = function() {
        var deferred = $q.defer(),
            self = this;
        window.texts[this.urn].getFirstPassagePlus({
          success : function(ref) {
              self.passage = ref;
              createPassage.call(self);
              self.updatePassage.call(self);
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