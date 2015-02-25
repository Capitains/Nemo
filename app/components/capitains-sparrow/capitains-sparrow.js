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
                  object.fulltext = tempTitle;
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
            $this = this;
        if(window.texts[this.urn].passages[this.passage].body) {
          (function () {
            $this.Passage = window.texts[$this.urn].passages[$this.passage];
            deferred.resolve();
          })()
          return deferred.promise;
        }
        window.texts[this.urn].passages[this.passage].retrieve({
          success : function() {
              $this.updatePassage.call($this);
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
            $this = this;
        window.texts[this.urn].getFirstPassagePlus({
          success : function(ref) {
              $this.passage = ref;
              createPassage.call($this);
              $this.updatePassage.call($this);
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