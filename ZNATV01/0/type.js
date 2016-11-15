define([
  'angular',
  'lodash',
  './editorCtrl.js',
],
function (angular) {
  'use strict';

  var module = angular.module('grafiz.services');

  module.factory('ZNATV01', function() {
    function ZNATV01() {
      this.meta = {
        type: 'ZNATV01',
        editor: 'partials/editor.html'
      };
    }

    return ZNATV01;
  });

});
