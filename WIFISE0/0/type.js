define([
  'angular',
  'lodash',
  './editorCtrl.js',
],
function (angular) {
  'use strict';

  var module = angular.module('grafiz.services');

  module.factory('WIFISE0', function() {
    function WIFISE0() {
      this.meta = {
        type: 'WIFISE0',
        editor: 'partials/editor.html'
      };
    }

    return WIFISE0;
  });

});
