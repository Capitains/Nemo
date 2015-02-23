"use strict";

angular.module('arethusa.tei').directive('teiParser', [
  '$compile',
  function($compile) {
    return {
      restrict: 'A',
      scope: {
        template    : '=teiParser',
        notebook    : '=notebook'
      },
      link: function(scope, element, attrs) {
        scope.$watch('template', function(newVal, oldVal) {
          // @balmas TODO - need to confirm when we should expect
          // newVal to equal oldVal and when not
          // as currently coded anyway the watch seems only to 
          // execute when both are equal -- this came up when
          // coding the text_context directive as well
          if (newVal) {
            element.empty();
            init();
          }
        });

        var init = function() {
          var template = scope.template;
          var counter = 0;
          while(template !== template.replace("<note>", "<note notebook=\"notebook\" identifier=\"" + counter + "\">")) {
            template = template.replace("<note>", "<note notebook=\"notebook\" identifier=\"" + counter + "\">");
            counter++;
          }
          element.append($compile(template)(scope));
        }
      }
    };
  }
]);
