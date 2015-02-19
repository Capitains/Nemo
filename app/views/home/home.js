'use strict';

angular.module('capitainsNemo.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', ['$scope', 'Repository', function($scope, Repository) {
  $scope.layout = {
    categories : {
      textgroups : true,
      works : false,
      texts : false,
      passages : false
    },
    isSelected : function(div) {
      return ($scope.layout.categories[div] === true) ? true : false;
    },
    select : function(div) {
      angular.forEach($scope.layout.categories, function(value, key) {
        $scope.layout.categories[key] = (div === key);
      });
    },
  }

  $scope.items = {
    parents : {
      works : "textgroups",
      texts : "works",
      passages : "texts"
    },
    available : {
      textgroups : {},
      works : {},
      texts : {},
      passages : {}
    },
    /**
     * Contains the key of different layers of the text
     * @type {Object}
     */
    selected : {
      textgroup : null,
      work : null,
      text : null, // Text is actually an object (As the title is Work).
      passage : null // Passage is actually an object
    },
    /**
     * [select description]
     * @param   {[type]} type   [description]
     * @param   {[type]} value  [description]
     * @returns {[type]}        [description]
     */
    selectFor : function(type, value) {
      if (type === "pages") {
        var urn = this.selected.text.text.urn;
        var start = [], end = [];
        //We construct the urn passage
        for (var i = 0; i <= this.selected.text.start.length - 1; i++) {
          if(typeof this.selected.text.start[i] === "undefined" || this.selected.text.start[i] === "") {
            break;
          }
          start.push(this.selected.text.start[i])
        };
        for (var i = 0; i <= start.length - 1; i++) {
          if(typeof this.selected.text.end[i] === "undefined" || this.selected.text.end[i] === "") {
            break;
          }
          end.push(this.selected.text.end[i])
        };
        var urn = urn + ":" + start.join(".") + "-" + end.join(".");

        this.selected.passage = Repository.passage(
          urn,
          "http://localhost:8080/exist/rest/db/xq/CTS.xq?",
          this.selected.text.text.inventory
        );

        var _this = this;
        _this.selected.passage.load().then.call(this, function() {
          _this.selected.page = {
            text : _this.selected.passage.Passage.getText(),
            title : _this.selected.work,
            author : _this.selected.textgroup
          }
        });
      } else if(type === "passages") {

        this.selected.text = {
          text : value,
          start : value.citations.map(function(val) { return ""; }),
          end : value.citations.map(function(val) { return ""; })
        };

      } else {

        this.selected[type.slice(0,-1)] = value;
        this.available[type] = this.available[this.parents[type]][value];

      }
      $scope.layout.select(type);
    }
  }

  $scope.repository = Repository.repository("http://localhost:8080/exist/rest/db/xq/CTS.xq?", 3);
  $scope.repository.Repository.addInventory("annotsrc", "Perseids Text");
  /* 
    Loading the data
  */
  $scope.repository.load().then(
    //Success
    function() {
      angular.forEach($scope.repository.Repository.inventories, function(inventory) {
        var textgroups = inventory.getRaw();
        angular.forEach(textgroups, function(works, textgroup) {
          angular.forEach(works, function(types, work) {
            angular.forEach(types, function(text, type) {
              angular.forEach(text, function(object, title) {
                object.inventory = inventory.identifier;
                textgroups[textgroup][work][type][title] = object;
                /*
                BrowsingData.add({
                  title : [textgroup, work, type, title].join(", "),
                  text : object
                });
*/
              })
            })
          })
        })
        angular.extend($scope.items.available.textgroups, textgroups);
      });
    },
    function() {
      alert("Not able to get to the API")
    }
  );
}]);