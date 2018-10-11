'use strict';

angular.module('strudelWeb.landingpage', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/landingpage', {
            templateUrl: 'landingpage/landingpage.html',
            controller: 'LandingPageCtrl'
        });
    }])

    .controller('LandingPageCtrl', ['$scope', '$rootScope', '$window', '$resource', '$mdMedia', '$interval', '$location', 'settings',
        function ($scope, $rootScope, $window, $resource, $mdMedia, $interval, $location, settings) {
            document.getElementById("myCarousel").style.display="block";
            document.getElementById("myFooter").style.visibility="visible";
            var sessionInfoResource = $resource(settings.URLs.apiBase + settings.URLs.sessionInfo);
            sessionInfoResource.get({}).$promise.then(function (sessionData) {
                if (sessionData.has_oauth_access_token !== "true") {
                    document.getElementById("login").style.display="block";
                    document.getElementById("logout-btn").style.display="none";
                    document.getElementById("joblistmgr").style.display="none";
                    document.getElementById("jobsubmitmgr").style.display="none";
                }else{
                    document.getElementById("login").style.display="none";
                    document.getElementById("logout-btn").style.display="block";
                    document.getElementById("joblistmgr").style.display="block";
                    document.getElementById("jobsubmitmgr").style.display="block";                    
                }
            })
        }

    ]);
