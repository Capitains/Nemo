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
  $scope.sidebar = new Layout(['notes']);

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

  $scope.repository = new Repository(window.CTSAPI, 3);
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
        //If we have a urn.
        if(typeof $route.current.params.urn !== "undefined") {
          $scope.repository.find($route.current.params.urn).then(function(text) {

            var passage = new Passage(
              $route.current.params.urn,
              window.CTSAPI,
              text.inventory,
              text
            );

            passage.load().then.call(this, function() {
              $scope.items.selected.passage = passage.Passage;
            });
          });
        }
      });
    },
    function() {
      alert("Not able to get to the API")
    }
  );
}]);