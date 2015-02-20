angular.module('capitainsNemo.utils', [])
  .factory('Layout', ['$q', function($q) {
    var Layout =  function() {
      this.categories = {};
      /**
       * For a given categories, checks if this has to be shown
       * @param   {string}  div Category
       * @returns {Boolean}     [description]
       */
      this.isSelected = function(div) {
        if(typeof this.categories[div] === "undefined") { this.categories[div] = false; }
        return (this.categories[div] === true) ? true : false;
      }
      /**
       * Select a category to show
       * @param   {string}  div Category
       * @return {[type]}     [description]
       */
      this.select = function(div) {
        var $this = this;
        angular.forEach(this.categories, function(value, key) {
          $this.categories[key] = (div === key);
        });
      }
    }
    return Layout;
  }]);
