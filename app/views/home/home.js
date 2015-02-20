'use strict';

angular.module('capitainsNemo.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  var HomeController = {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  };
  $routeProvider.when('/', HomeController);
  $routeProvider.when('/:urn', HomeController);
}])

.controller('HomeCtrl', [
    '$scope',
    '$route',
    'Repository',
    'Passage', 
    'Layout', 
  function($scope, $route, Repository, Passage, Layout) {

  $scope.layout = new Layout();

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

  $scope.repository = new Repository("http://localhost:8080/exist/rest/db/xq/CTS.xq?", 3);
  $scope.repository.Repository.addInventory("annotsrc", "Perseids Text");
  /* 
    Loading the data
  */
 $scope.indexes = {
  hierarchical : {},
  fulltext : {}
 };

  $scope.repository.load().then(
    //Success
    function() {
      $scope.repository.indexing(function(HierarchicalIndex, FulltextIndex) {
        $scope.indexes.hierarchical = HierarchicalIndex;
        $scope.indexes.fulltext = FulltextIndex;
        $scope.items.available.textgroups = $scope.indexes.hierarchical;
      });
    },
    function() {
      alert("Not able to get to the API")
    }
  );
}]);