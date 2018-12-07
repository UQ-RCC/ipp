'use strict';

angular.module('microvolution.converter', ['ngRoute', 'ngResource'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/converter', {
            templateUrl: 'converter/converter.html',
            controller: 'ConverterCtrl'
        });
    }])

    .controller('ConverterCtrl', ['$scope', '$rootScope', '$interval', '$location', 
        'SessionInfoFactory', 'AccessTokenFactory', 'TokenHandler',
        function ($scope, $rootScope, $interval, $location, 
            SessionInfoFactory, AccessTokenFactory, TokenHandler) {
            
            
            // Gets the session data and redirects to the login screen if the user is not logged in
            SessionInfoFactory.get({}).$promise.then(function (sessionData) {
		        if (sessionData.has_oauth_access_token !== "true") {
                    $location.path("/landingpage");
                    return;
                }            
                document.getElementById("myCarousel").style.display="none";
                document.getElementById("home-btn").className="menu__link";
                document.getElementById("about-btn").className="menu__link";
                document.getElementById("faq-btn").className="menu__link";
                document.getElementById("contact-btn").className="menu__link";
                document.getElementById("accesspolicy-btn").className="menu__link";
                document.getElementById("login").style.display="none";
                document.getElementById("logout-btn").style.display="block";
                document.getElementById("joblistmgr").style.display="block";
                document.getElementById("about-btn").style.display="none";
                document.getElementById("contact-btn").style.display="none";
                document.getElementById("accesspolicy-btn").style.display="none";
                document.getElementById("joblistmgr").className="menu__link";
                document.getElementById("jobsubmitmgr").style.display="block";
                document.getElementById("jobsubmitmgr").className="menu__link";
                document.getElementById("convertermgr").style.display="block";
                document.getElementById("convertermgr").className="menu__link active";
                AccessTokenFactory.get({}).$promise.then(function (tokenData) {
                    TokenHandler.set(tokenData.access_token);
                    
                });
                 
            });

            

        }]);




