'use strict';

angular.module('microvolution.partials', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/error', {templateUrl: 'partials/404.html', controller: 'ErrorCtrl'});
            $routeProvider.when('/contact', {templateUrl: 'partials/contact.html', controller: 'TextCtrl'});
    }])

    .controller('ErrorCtrl', ['$scope', '$rootScope', '$mdMedia',
        function ($scope, $rootScope, $mdMedia) {


        }])

    .controller('TextCtrl',['$scope', '$rootScope', '$mdMedia', '$location',
        function ($scope, $rootScope, $mdMedia, $location) {
            //document.getElementById("myFooter").style.visibility="hidden";
            var path = $location.path().replace(/\//g,'') + "-btn";
            document.getElementById("home-btn").className="menu__link";
            document.getElementById("joblistmgr").className="menu__link";
            document.getElementById("jobsubmitmgr").className="menu__link";
            document.getElementById("convertermgr").className="menu__link";
            document.getElementById("filesmanagermgr").className="menu__link";
            document.getElementById("prepmgr").className="menu__link";
            ["contact-btn"].forEach(function(item){
                if(item == path){
                    document.getElementById(item).className="menu__link active";
                }
                else{
                    document.getElementById(item).className="menu__link";
                }
            });
        }])

    