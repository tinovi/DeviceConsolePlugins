define([
  'angular',
  'lodash',
],
function (angular) {
  'use strict';

  var module = angular.module('grafiz.controllers');

  module.controller('ARDETH1Ctrl', function($scope, $rootScope, $log, wsSrv, deviceSrv) {

    $scope.init = function() {
      $scope.fr = { interval: 10000 };
      $scope.logs = [];
      var i = 0;
      $scope.outputs = [
        {id:'0', name:'o1', value:false},
        {id:'1', name:'o2', value:false},
        {id:'2', name:'o3', value:false},
        {id:'3', name:'o4', value:false},
      ];

      $scope.oper = [
        {id:'0', name:'N/A'},
        {id:'1', name:'='},
        {id:'2', name:'<'},
        {id:'3', name:'>'},
      ];
      $scope.dir = [
        {id:'0', name:'OFF'},
        {id:'1', name:'ON'},
      ];

      $scope.inputs = [];
      for(i=0;i<4;i++){
        var iitem = {id:0, type:0, valA:0, valB:0};
        iitem.id = i;
        iitem.nameA = $scope.current.cols[i*2];
        iitem.nameB = $scope.current.cols[i*2+1];
        $scope.inputs.push(iitem);
      }

      $scope.triggers =[];
      for(i=0;i<20;i++){
        var titem = {id:0, input:0, oper:0, out:0, out_dir:0, val:0};
        titem.id = i;
        $scope.triggers.push(titem);
      }

      $scope.sendId = wsSrv.connect($scope.current.id, $scope.msgCB, $scope.msgSCB);

    };

    $rootScope.$on("$locationChangeSuccess", function() {
      wsSrv.close($scope.current.id, $scope.sendId);
    });

    $scope.send = function(message) {
      wsSrv.sendBin($scope.current.id, message);
    };

    $scope.msgSCB = function(message) {
      if(message.type='log'){
        $scope.logs.push(message);
        if($scope.logs.length>100){
          delete $scope.logs[0];
        }
        //$log.log('log: '+message.text, message);
      }else{
        $log.log('in txt>: ',message);
      }
    };

//var usernameView = new Uint8Array(buffer, 0, 16);
//var idView = new Uint16Array(buffer, 16, 1);
//var scoresView = new Float32Array(buffer, 18, 32);
//
//console.log("ID: " + idView[0] + " username: " + usernameView[0]);
//for (var j = 0; j < 32; j++) { console.log(scoresView[j]) }
//    static byte  CMD_MAC =12;  //6 byte mac
//    static byte  CMD_NET =13;  //net settings IP+GW+SM+DNS = 4x4=16bytes
//    static byte  CMD_INT_TYPE =14;  // 8 byte
//    static byte  CMD_TRIG =15;  //  6 byte
//    static byte  CMD_TRIG_ALL  =16;  // TRIG_COUNT * 6 byte
//    static byte  CMD_TRAP_ADDR =17;  //28 byte adderess
//    static byte  CMD_TRIG_OUT = 18;  // 2byte

    $scope.msgCB = function(message) {
      if(message instanceof ArrayBuffer){
        var dv = new DataView(message);
        //var c = new Uint8Array(message, 0, 1);
        var cmd = dv.getUint8(2);
        $log.log('rec: '+ message.byteLength +' cmd:'+cmd);
        var i;
        if(cmd===7){//trap
          for (i = 0; i < 4; i++) {
            //var val = new Int16Array(message, 1+i*4, 2);
            $scope.inputs[i].valA = dv.getInt16(3+i*4,true);
            if($scope.inputs[i].valA && $scope.inputs[i].valA!==0) {
              $scope.inputs[i].valA=Math.round($scope.inputs[i].valA)/10;
            }
            $scope.inputs[i].valB = dv.getInt16(5+i*4,true);
            if($scope.inputs[i].valB && $scope.inputs[i].valB!==0) {
              $scope.inputs[i].valB=Math.round($scope.inputs[i].valB)/10;
            }
          }
          var a = dv.getInt8(19);
          for (i = 0; i < 4; i++) {
            if(((a >> i) & 1)===1){
              $scope.outputs[i].value = true;
            }else{
              $scope.outputs[i].value = false;
            }
          }
          $scope.$apply();
        }else if(cmd===12){//MAC
          var mac = new Uint8Array(message, 3, 6);
          $scope.mac = (mac[0]& 0xff)+'.'+(mac[1]& 0xff)+'.'+(mac[2]& 0xff)+'.'+(mac[3]& 0xff)+'.'+(mac[4]& 0xff)+'.'+(mac[5]& 0xff);
          $scope.$apply();
        }else if(cmd===19){//Interval
//          var interval = new Uint32Array(message, 3, 1);
          $scope.fr.interval = dv.getUint32(3);
          $log.log('interval',$scope.fr.interval);
          $scope.$apply();
        }else if(cmd===13){//CMD_NET
          var ip = new Uint8Array(message, 3, 4);
          $scope.ip = (ip[0]& 0xff)+'.'+(ip[1]& 0xff)+'.'+(ip[2]& 0xff)+'.'+(ip[3]& 0xff);
          var gw = new Uint8Array(message, 7, 4);
          $scope.gw = (gw[0]& 0xff)+'.'+(gw[1]& 0xff)+'.'+(gw[2]& 0xff)+'.'+(gw[3]& 0xff);
          var sm = new Uint8Array(message, 11, 4);
          $scope.sm = (sm[0]& 0xff)+'.'+(sm[1]& 0xff)+'.'+(sm[2]& 0xff)+'.'+(sm[3]& 0xff);
          var dns = new Uint8Array(message, 15, 4);
          $scope.dns =(dns[0]& 0xff)+'.'+(dns[1]& 0xff)+'.'+(dns[2]& 0xff)+'.'+(dns[3]& 0xff);
          $scope.$apply();
        }else if(cmd===14){//CMD_INT_TYPE
          var it = new Uint8Array(message, 3, 4);
          for (i = 0; i < 4; i++) {
            $scope.inputs[i].type=it[i];
            //$log.log('add input'+i +' t:'+it[i]);
          }
          $scope.$apply();
        //}else if(cmd===15){//CMD_TRIG
        }else if(cmd===16){//CMD_TRIG_ALL
          for (i = 0; i < 20; i++) {
            var b4 = new Uint8Array(message, i*6+3, 6);
            $scope.triggers[i].input = b4[0];
            $scope.triggers[i].oper = b4[1];
            $scope.triggers[i].out = b4[2];
            $scope.triggers[i].out_dir = b4[3];
            var buf = new ArrayBuffer(2);
            var byteArray = new Uint8Array(buf);
            byteArray[1]=b4[4];
            byteArray[0]=b4[5];
            var dv1 = new DataView(buf);
            $scope.triggers[i].val = dv1.getInt16(0)/10;
          }
          $scope.$apply();
        //}else if(cmd===17){//CMD_TRAP_ADDR
        //}else if(cmd===18){//CMD_TRIG_OUT
        }
      }
    };

    $scope.outBtnClick = function (outId) {
      $log.log('outBtnClick',$scope.outputs[outId]);
      //  byte[] by = {CMD_TRIG_OUT,(byte)id,b};
      var byteArray = new Uint8Array(3);
      byteArray[0] = 18;
      byteArray[1] = outId;
      if($scope.outputs[outId].value){
        byteArray[2] = 1;
      }else{
        byteArray[2] = 0;
      }
      $scope.send(byteArray);
    };

    $scope.ie_save = function() {
      $log.log('ie_save');
      $scope.dismiss();
      //byte[] by = {CMD_INT_TYPE,(byte)id,dev.getInputs()[id].getType()};
      var byteArray = new Uint8Array(3);
      byteArray[0] = 14;
      byteArray[1] = $scope.current_input.id;
      byteArray[2] = $scope.current_input.type;
      $scope.send(byteArray);
      $scope.setCol($scope.current_input.id,$scope.current_input.nameA,$scope.current_input.nameB);
    };

    $scope.ie_dismiss = function() {
      $log.log('ie_dismiss');
      $scope.dismiss();
    };

    $scope.editInput = function(input) {
      $log.log('editInput',input);
      $scope.current_input = input;
      $scope.appEvent('show-modal', {
        src: deviceSrv.getPartialBaseUrl($scope.current)+'/partials/inputEditor.html',
        scope: $scope.$new(),
      });
    };

    $scope.te_save = function() {
      $log.log('te_save');
      $scope.dismiss();
      $scope.te_store();
    };

    $scope.te_store = function() {
      var buf = new ArrayBuffer(8);
      var byteArray = new Uint8Array(buf,0,6);
      byteArray[0]=15;
      byteArray[1]=$scope.current_trig.id;
      byteArray[2]=$scope.current_trig.input;
      byteArray[3]=$scope.current_trig.oper;
      byteArray[4]=$scope.current_trig.out;
      byteArray[5]=$scope.current_trig.out_dir;
      var val = new Int16Array(buf, 6, 1);
      var v = Math.round($scope.current_trig.val)*10;
      //$log.log('val',v);

      val[0] = v;
      $scope.send(buf);
    };

    $scope.updateInterval = function() {
      $log.log('updateInterval'+$scope.fr.interval);
      var buf = new ArrayBuffer(5);
      var dv = new DataView(buf);
      dv.setUint8(0,19);
      dv.setUint32(1,Math.round($scope.fr.interval));
      $scope.send(buf);
    };

    $scope.te_dismiss = function() {
      $log.log('te_dismiss');
      $scope.dismiss();
    };

    $scope.editTrigger = function(trig) {
      $scope.current_trig = trig;
      $log.log('editTrigger',$scope.current_trig);
      $scope.appEvent('show-modal', {
        src: deviceSrv.getPartialBaseUrl($scope.current)+'/partials/triggerEditor.html',
        scope: $scope.$new(),
      });
    };

    $scope.te_clear = function(trig) {
      $scope.current_trig = trig;
      $scope.current_trig.input = 0;
      $scope.current_trig.oper = 0;
      $scope.current_trig.out = 0;
      $scope.current_trig.out_dir = 0;
      $scope.current_trig.val = 0;
      $scope.te_store();
    };

  });

});
