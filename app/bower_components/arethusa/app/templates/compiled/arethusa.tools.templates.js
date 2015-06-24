angular.module('arethusa.tools').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/arethusa.tools/morph_tools.html',
    "<div class=\"row\">\n" +
    "  <h3>Arethusa Morph Tools</h3>\n" +
    "\n" +
    "  <div class=\"morph-tools-form-import\">\n" +
    "    <div class=\"fade\" ng-if=\"ready\">\n" +
    "      <ul>\n" +
    "        <li ng-repeat=\"file in files\">\n" +
    "          <a ng-click=\"loadCsvFile(file)\">{{ file.name }}</a>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "\n" +
    "    <div>\n" +
    "      <button class=\"small rounded\" ng-click=\"importFile()\">\n" +
    "        Import forms from file\n" +
    "      </button>\n" +
    "      <button class=\"small rounded\" ng-click=\"exportFile()\">\n" +
    "        Export forms to file\n" +
    "      </button>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"status.importForms.count\">\n" +
    "      {{ status.importForms.count}} forms successfully imported!\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"status.exportForms.count\">\n" +
    "      {{ status.exportForms.count}} forms successfully exported!\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"importStarted\" style=\"color: green\">\n" +
    "      Processing import...\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"morph-tools-frequency-import\">\n" +
    "    <div>\n" +
    "      <button class=\"small rounded\" ng-click=\"importFrequencyFile()\">\n" +
    "        Import frequency data from file\n" +
    "      </button>\n" +
    "      <button class=\"small rounded\" ng-click=\"exportFrequencyFile()\">\n" +
    "        Export frequency data to file\n" +
    "      </button>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"status.importFrequency.count\">\n" +
    "      {{ status.importFrequency.count}} forms successfully imported!\n" +
    "    </div>\n" +
    "\n" +
    "    <div ng-if=\"status.exportFrequency.count\">\n" +
    "      {{ status.exportFrequency.count}} forms successfully exported!\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "</div>\n"
  );

}]);
