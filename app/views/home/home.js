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
      textgroups : false,
      works : false,
      texts : false,
      passages : false,
      search : true,
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
    }
  }

  $scope.repository = Repository.repository("http://localhost:8080/exist/rest/db/xq/CTS.xq?", 3);
  $scope.repository.Repository.addInventory("annotsrc", "Perseids Text");
  /* 
    Loading the data
  */
 $scope.fullstringTexts = [];

  $scope.repository.load().then(
    //Success
    function() {
      angular.forEach($scope.repository.Repository.inventories, function(inventory, inventoryName) {
        var textgroups = inventory.getRaw();
        var modified = {}
        angular.forEach(textgroups, function(works, textgroup) {
          angular.forEach(works, function(types, work) {
            //We erase types
            var editions = {}
            angular.forEach(types, function(text, type) {
              angular.forEach(text, function(object, title) {
                object.inventory = inventory.identifier;
                object.author    = textgroup;
                object.title     = work;
                object.display   = object.getTitle();
                object.start     = object.citations.map(function(val) { return ""; });
                object.end       = object.citations.map(function(val) { return ""; });
                editions["("+ inventoryName + " ) " + title] = object;

                delete editions[title];
                var tempTitle = [inventoryName, textgroup, work, title].join(", ")
                $scope.fullstringTexts.push(object);
              })
            })
            textgroups[textgroup][work] = {display : work, author : textgroup, children : editions};
          })
          modified[textgroup] = {display : textgroup, children : works}
        })
        angular.extend($scope.items.available.textgroups, modified);
      });
    },
    function() {
      alert("Not able to get to the API")
    }
  );
}]);