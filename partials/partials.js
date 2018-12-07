'use strict';

angular.module('microvolution.partials', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function ($routeProvider) {

            $routeProvider.when('/error', {templateUrl: 'partials/404.html', controller: 'ErrorCtrl'});
            $routeProvider.when('/about', {templateUrl: 'partials/about.html', controller: 'TextCtrl'});
            $routeProvider.when('/contact', {templateUrl: 'partials/contact.html', controller: 'ContactCtrl'});
            $routeProvider.when('/support', {templateUrl: 'partials/contact.html', controller: 'TextCtrl'});
            $routeProvider.when('/accesspolicy', {templateUrl: 'partials/accesspolicy.html', controller: 'TextCtrl'});
            $routeProvider.when('/faq', {templateUrl: 'partials/faq.html', controller: 'TextCtrl'});
    }])

    .controller('ErrorCtrl', ['$scope', '$rootScope', '$mdMedia',
        function ($scope, $rootScope, $mdMedia) {


        }])

    .controller('TextCtrl',['$scope', '$rootScope', '$mdMedia', '$location',
        function ($scope, $rootScope, $mdMedia, $location) {
            document.getElementById("myCarousel").style.display="none";
            //document.getElementById("myFooter").style.visibility="hidden";
            var path = $location.path().replace(/\//g,'') + "-btn";
            document.getElementById("myCarousel").style.display="none";
            document.getElementById("joblistmgr").className="menu__link";
            document.getElementById("jobsubmitmgr").className="menu__link";
            document.getElementById("convertermgr").className="menu__link";
            ["home-btn", "about-btn", "faq-btn", "contact-btn", "accesspolicy-btn"].forEach(function(item){
                if(item == path){
                    document.getElementById(item).className="menu__link active";
                }
                else{
                    document.getElementById(item).className="menu__link";
                }
            })
        }])

    .controller('ContactCtrl',['$scope', '$http','$rootScope', '$window', '$resource', '$mdMedia', '$interval', '$location','$mdDialog','settings',
        function ($scope, $http,$location,$mdDialog) {
            document.getElementById("myCarousel").style.display="none";
            document.getElementById("home-btn").className="menu__link";
            document.getElementById("about-btn").className="menu__link";
            document.getElementById("faq-btn").className="menu__link";
            document.getElementById("contact-btn").className="menu__link active";
            document.getElementById("accesspolicy-btn").className="menu__link";
            document.getElementById("joblistmgr").className="menu__link";
            document.getElementById("jobsubmitmgr").className="menu__link";
            document.getElementById("convertermgr").className="menu__link";
        }])

