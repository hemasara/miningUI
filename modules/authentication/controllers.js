'use strict';
 
angular.module('Authentication')
 
.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService', '$window', '$localStorage', 'onlineStatus', 'CoronlineStatus',
    function ($scope, $rootScope, $location, AuthenticationService, $window, $localStorage, onlineStatus, CoronlineStatus ) {

        initController();
        
        function initController() {
            AuthenticationService.Logout();
        };   

        console.log($scope.http_online_status_string);
 
        $scope.login = function () {
            $scope.dataLoading = true;
            console.log($scope.username);
            console.log($scope.password);
            AuthenticationService.Login($scope.username, $scope.password, function(response) {
                if(response.success) {
                    $scope.currentUser = $localStorage.currentUser.username;
                    $location.path('/homepage/');
                } else {
                    $scope.error = response.message;
                    $scope.dataLoading = false;
                }
            });
        };
        
        
        $scope.onlineStatus = onlineStatus;
        
        $scope.$watch('onlineStatus.isOnline()', function(online) {
            $scope.online_status_string = online ? 'online' : 'offline';
        });
       
        $rootScope.$on('httpOffline', function() {
        	$scope.http_online_status_string = 'offline';
        });

		$scope.CoronlineStatus = CoronlineStatus;

		 $scope.$watch('CoronlineStatus.isOnline()', function(
				 Coronline) {
			 $scope.cor_online_status_string = Coronline ? 'online' : 'offline';
		 });
        
    }]);