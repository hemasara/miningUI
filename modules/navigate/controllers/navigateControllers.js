 'use strict';
 
var myApp = angular.module('Navigate', ['mobile-angular-ui','720kb.datepicker','720kb.socialshare','angularFileUpload','angular-table','ngFileUpload','highcharts-ng','angular-clockpicker'/*,'ngCordova.plugins.network'*/]);

		myApp.directive('fileModel', ['$parse', function ($parse) {
            return {
               restrict: 'A',
               link: function(scope, element, attrs) {
                  var model = $parse(attrs.fileModel);
                  var modelSetter = model.assign;
                  
                  element.bind('change', function(){
                     scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                     });
                  });
               }
            };
         }]);
		 
		myApp.directive('validFile',function(){
		return {
			require:'ngModel',
			link:function(scope,el,attrs,ctrl){
				ctrl.$setValidity('validFile', el.val() != '');
				el.bind('change',function(){
					ctrl.$setValidity('validFile', el.val() != '');
					scope.$apply(function(){
						ctrl.$setViewValue(el.val());
						ctrl.$render();
					});
				});
				}
			}
		});
      
         myApp.service('fileUpload', ['$http', function ($http) {
            this.uploadFileToUrl = function(file, uploadUrl){
               var fd = new FormData();
               fd.append('file', file);
            
               $http.post(uploadUrl, fd, {
                  transformRequest: angular.identity,
                  headers: {'Content-Type': 'multipart/form-data'}
               })
            
               .success(function(){
				   console.log("Success");
               })
            
               .error(function(){
               });
            }
         }]);
         
         myApp.service('SplitArrayService', function () {
        	 return {
        	     SplitArray: function (array, columns) {
        	         if (array.length <= columns) {
        	             return [array];
        	         };

        	         var rowsNum = Math.ceil(array.length / columns);

        	         var rowsArray = new Array(rowsNum);

        	         for (var i = 0; i < rowsNum; i++) {
        	             var columnsArray = new Array(columns);
        	             for (var j = 0; j < columns; j++) {
        	                 var index = i * columns + j;

        	                 if (index < array.length) {
        	                     columnsArray[j] = array[index];
        	                 } else {
        	                     break;
        	                 }
        	             }
        	             rowsArray[i] = columnsArray;
        	         }
        	         return rowsArray;
        	     }
        	 }
        	 });


         myApp.filter('formatDateTime', function ($filter) {
            return function (date, format) {
                if (date) {
                    return moment(Number(date)).format(format || "HH:mm");
                }
                else
                    return "";
            };
        });
         
         myApp.directive('navback', ['$window','$location', function($window,$location) {
             return {
                 restrict: 'A',
                 link: function (scope, elem, attrs) {
                     elem.bind('click', function () {
                         $window.history.back();
                         /*$location.path('/homepage/');*/
                     });
                 }
             };
         }]);
         
myApp.controller('navigateController', ['$scope','$http','$rootScope','$window','$location','SharedState', 'fileUpload', 'FileUploader', 'SplitArrayService', 'Upload','moment','AuthenticationService','$localStorage','onlineStatus',
                                        function ($scope, $http, $rootScope, $window, $location, SharedState , fileUpload, FileUploader , SplitArrayService, Upload, moment, AuthenticationService, $localStorage, onlineStatus) {
	console.log("Inside navigate controller");
	
	$scope.workorder =[];
	$scope.stone =[];

    var urllink = $rootScope.UrlLink;
	var apilink_stone_post = urllink+"stone/create";
	var apilink_wo_post = urllink+"workorder/create";
	
	 console.log("Nav Controllers: "+$rootScope.UrlLink);	
	
    $scope.onlineStatus = onlineStatus;
/*    $scope.httponline = function() {
        return $rootScope.online;
    }*/
    
    $scope.$watch('onlineStatus.isOnline()', function(online) {
        $scope.online_status_string = online ? 'online' : 'offline';
    });
/*    $scope.$watch('httponline()', function(online) {
        $scope.http_online_status_string = online ? 'online' : 'offline';
    });*/

    
    $rootScope.$on('httpOffline', function() {
    	$scope.http_online_status_string = 'offline';
    });
    
	var username=$localStorage.currentUser.username;
    	console.log(" NC UserName: "+username);
    $scope.currentUser = username;
	$scope.stonedetails={};
	
	console.log("Event1: "+SharedState.get('event1'));
	
	$scope.logOut= function(){
		delete $localStorage.currentUser;
        $http.defaults.headers.common.Authorization = '';
		$location.path('/login');
	};
	
	$scope.workOrder= function(){
		$location.path('/workorder/');
	};
	
	$scope.stoneDetails= function(){
		$location.path('/stonedetails/');
	};
	
	$scope.imageDetails= function(){
		$location.path('/images/');
	};
	
	$scope.charts= function(){
		$location.path('/charts/');
	};
	
	$scope.reports= function(){
		$location.path('/reports/');
	};
	
	$scope.stoneDetailsSave = function(stoneDetails) {
	    /*var apilink = "http://10.30.54.162:8080/mining/ms/stone/create";*/
		var apilink = $rootScope.UrlLink+"stone/create";
		var stoneDetailssave = angular.toJson(stoneDetails);		
		console.log(stoneDetailssave);
		
		 $http({
		        method: 'POST',
		        url: apilink,
		        data: stoneDetailssave,
		        transformRequest: angular.identity,
		        transformResponse: angular.identity,
		        headers: {'Content-Type': 'application/json'}}
		    ).then(
		    	    function(res) {
		    	        console.log('succes !', res.data);
		    	        SharedState.initialize($scope, 'event2');
		    	        SharedState.turnOff('event2');
		    	    },
		    	    function(err) {
		    	        console.log('error...', err);
		    	    }
		    	);
	
	};
	
	$scope.getTimeDiff = function(wo) {
		var iDate = moment(wo.dtIN + ' ' + (moment(wo.tmIN).format("HH:mm")), "YYYY-MM-DD HH:mm");
		var oDate = moment(wo.dtOUT + ' ' + (moment(wo.tmOUT).format("HH:mm")), "YYYY-MM-DD HH:mm");
		var diff = moment.utc(oDate.diff(iDate)).format("HH:mm");
		return diff;		
	};
	
	$scope.workorderCreate = function(e, wo) {
		console.log(wo);
		var iDate = moment(wo.dtIN + ' ' + (moment(wo.tmIN).format("HH:mm")), "YYYY-MM-DD HH:mm");
		var oDate = moment(wo.dtOUT + ' ' + (moment(wo.tmOUT).format("HH:mm")), "YYYY-MM-DD HH:mm");
		var diff = moment.utc(oDate.diff(iDate)).format("HH:mm");
		console.log(diff);
	    /*var apilink = "http://10.30.54.162:8080/mining/ms/workorder/create";*/
	    var apilink = $rootScope.UrlLink+"workorder/create";
	    console.log(e);
	    var woData = {
	    		empName: e,
	    		timeIN: moment(wo.tmIN).format("HH:mm"),
	    		timeOUT: moment(wo.tmOUT).format("HH:mm"),
	    		workedHours: diff
            };
	    console.log(woData);
		var woCreate = angular.toJson(woData);		
		console.log(woCreate);
		
		 $http({
		        method: 'POST',
		        url: apilink_wo_post,
		        data: woCreate,
		        transformRequest: angular.identity,
		        transformResponse: angular.identity,
		        headers: {'Content-Type': 'application/json'}}
		    ).then(
		    	    function(res) {
		    	        console.log('success of work order!', res.data);
		    	        /*SharedState.turnOff('event1');*/
		    	        SharedState.initialize($scope, 'event1');
		    	        SharedState.turnOff('event1');
		    	       /* $rootScope.Ui.turnOff('event1');
		    	        $rootScope.Ui.toggle('event1');*/
		    	    },
		    	    function(err) {
		    	        console.log('error...', err);
		    	    }
		    	);
	
	};

	$scope.getFile = function(){
		console.log("Calling getFile");
		var apilink = $rootScope.UrlLink+"getImages";
		$http.get(apilink).then(function(response) {
			/*$scope.images = SplitArrayService.SplitArray(response.data,3);*/
			$scope.images = response.data;
			console.log($scope.images);
	    });
	};
	
	$scope.getWorkOrderDetails = function(){
		console.log("Calling getWorkOrderDetails");
		var apilink = $rootScope.UrlLink+"getWorkOrderDetails";
		$http.get(apilink).then(function(response) {			
			$scope.workorder = response.data;
	    });
	};
	
	$scope.config = {
		    itemsPerPage: 10,
		    fillLastPage: true
		  }
	
	$scope.getStoneDetails = function(){
		console.log("Calling getStoneDetails");
		var apilink = $rootScope.UrlLink+"getStoneDetails";
		$http.get(apilink).then(function(response) {
			$scope.stone = response.data;
	    });
	};
	
	$scope.uploadFile = function(){
        var file = $scope.myFile;
               
        console.log('file is ' );
        console.dir(file);
               
        /*var uploadUrl = "http://10.30.54.162:8080/mining/ms/image";*/
        var uploadUrl = $rootScope.UrlLink+"image";
        fileUpload.uploadFileToUrl(file, uploadUrl);
    };
	
	var uploader = $scope.uploader = new FileUploader({
        /*url: 'http://10.30.54.162:8080/mining/ms/image'*/
		url: $rootScope.UrlLink+'image'
    });

    // FILTERS
  
    // a sync filter
    uploader.filters.push({
        name: 'syncFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            console.log('syncFilter');
            return this.queue.length < 10;
        }
    });
  
    // an async filter
    uploader.filters.push({
        name: 'asyncFilter',
        fn: function(item /*{File|FileLikeObject}*/, options, deferred) {
            console.log('asyncFilter');
            setTimeout(deferred.resolve, 1e3);
        }
    });

    // CALLBACKS

    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
    };

    console.info('uploader', uploader);
    
    $scope.submit = function() {
        if ($scope.form.file.$valid && $scope.file) {
          $scope.upload($scope.file);
        }
      };
      
   // upload on file select or drop
      $scope.upload = function (file) {
    	  var apilink = $rootScope.UrlLink+"image";
          Upload.upload({
              /*url: 'http://10.30.54.162:8080/mining/ms/image',*/
        	  url: apilink,
              data: {file: file }
          }).then(function (resp) {
              /*console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);*/
        	  console.log(resp.data);
        	  $scope.getFile();
          }, function (resp) {
              console.log('Error status: ' + resp.status);
          }, function (evt) {
             /* var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);*/
          });
      };
      
       function getStoneDetails1(){
	  		console.log("Calling getStoneDetails");
	  		var apilink = $rootScope.UrlLink+"getStoneDetails";
	  		$http.get(apilink).then(function(response) {
	  			$scope.stone =[];
	  			$scope.stone = response.data;
	  	   });
       };
  		
      $scope.chartConfig = {
    	      chart: {
    	        type: 'column',
    	        reflow: true
    	      },
              yAxis: {
                  min: 0,
                  title: {
                      text: ''
                  }
              },
    	      series: [{
    	        data: [10, 15, 12, 8, 7],
    	        name: 'TILE',
    	        color: 'red'
    	      },{
    	        data: [1, 2, 12, 8, 7],
    	        name: 'SLAB',
    	        color: 'orange'
    	      }],
    	      title: {
    	        text: 'Report'
    	      }
      };
	
    }]);
