'use strict';

angular.module('strudelWeb.partials', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/error', {templateUrl: 'partials/404.html', controller: 'ErrorCtrl'});
            $routeProvider.when('/about', {templateUrl: 'partials/about.html', controller: 'TextCtrl'});
            $routeProvider.when('/contact', {templateUrl: 'partials/contact.html', controller: 'ContactCtrl'});
            $routeProvider.when('/support', {templateUrl: 'partials/contact.html', controller: 'TextCtrl'});
            $routeProvider.when('/accesspolicy', {templateUrl: 'partials/accesspolicy.html', controller: 'TextCtrl'});
            $routeProvider.when('/faq', {templateUrl: 'partials/faq.html', controller: 'TextCtrl'});
            $routeProvider.when('/full-width',{templateUrl: 'partials/full-width.html',controller:'TextCtrl'});
            $routeProvider.when('/sidebar',{templateUrl: 'partials/sidebar.html',controller:'TextCtrl'});
    }])

    .controller('ErrorCtrl', ['$scope', '$rootScope', '$window', '$resource', '$mdMedia', '$interval', '$location', '$mdDialog','settings',
        function ($scope, $rootScope, $window, $resource, $mdMedia, $interval, $location, $mdDialog,settings) {


        }])

    .controller('TextCtrl',['$scope', '$rootScope', '$window', '$resource', '$mdMedia', '$interval', '$location','settings',
        function ($scope, $rootScope, $window, $resource, $mdMedia, $interval, $location, settings, $anchorScroll) {
            document.getElementById("myCarousel").style.display="none";
            //document.getElementById("myFooter").style.visibility="hidden";
        }])

    .controller('ContactCtrl',['$scope', '$http','$rootScope', '$window', '$resource', '$mdMedia', '$interval', '$location','$mdDialog','settings',
        function ($scope, $http,$location,$mdDialog) {
            document.getElementById("myCarousel").style.display="none";
            //document.getElementById("myFooter").style.visibility="hidden";

            $scope.result = 'hidden';
            $scope.resultMessage;
            $scope.formData; //formData is an object holding the name, email, subject, and message
            $scope.submitButtonDisabled = false;
            $scope.submitted = false; //used so that form errors are shown only after the form has been submitted
            $scope.submit = function(contactform) {
                $scope.submitted = true;
                $scope.submitButtonDisabled = true;
                if (contactform.$valid) {
                    $http({
                        method  : 'POST',
                        url     : window.location.origin+"/contact_me.php",
                        data    : $.param($scope.formData),  //param method from jQuery
                        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  //set the headers so angular passing info as form data (not request payload)
                    }).success(function(data){
                        console.log(data);
                        if (data.success) { //success comes from the return json object

                            $scope.submitButtonDisabled = true;
                            $scope.resultMessage = data.message;
                            $scope.result='bg-success';
                        } else {
                            $scope.submitButtonDisabled = false;
                            $scope.resultMessage = data.message;
                            $scope.result='bg-danger';
                        }
                    });
                } else {
                    $scope.submitButtonDisabled = false;
                    $scope.resultMessage = 'Failed <img src="http://www.chaosm.net/blog/wp-includes/images/smilies/icon_sad.gif" alt=":(" class="wp-smiley">  Please fill out all the fields.';
                    $scope.result='bg-danger';
                }
            }

        }])

