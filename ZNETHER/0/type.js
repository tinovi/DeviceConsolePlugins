define([
  'angular',
  'lodash',
  './editorCtrl.js',
],
function (angular) {
  'use strict';

  var module = angular.module('grafiz.services');

  module.factory('ZNETHER', function() {
    function ZNETHER() {
      this.meta = {
        type: 'ZNETHER',
        editor: 'partials/editor.html'
      };
    }

    return ZNETHER;
  });

});
