module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'gh-pages': {
      src: ['app/**', 'index.html']
    }
  });

  // Register tasks.
  grunt.loadNpmTasks('grunt-gh-pages');

  // Default task. 
  grunt.registerTask('page', ['gh-pages'])
};
