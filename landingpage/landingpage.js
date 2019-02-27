'use strict';

angular.module('microvolution.landingpage', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/landingpage', {
            templateUrl: 'landingpage/landingpage.html',
            controller: 'LandingPageCtrl'
        });
    }])

    .controller('LandingPageCtrl', ['$scope', '$rootScope', '$window', '$resource', '$mdMedia', '$interval', '$location', 'settings',
        function ($scope, $rootScope, $window, $resource, $mdMedia, $interval, $location, settings) {
            document.getElementById("myCarousel").style.display="block";
            document.getElementById("about-btn").style.display="block";
            document.getElementById("accesspolicy-btn").style.display="block";
            document.getElementById("home-btn").className="menu__link active";
            document.getElementById("about-btn").className="menu__link";
            document.getElementById("faq-btn").className="menu__link";
            document.getElementById("accesspolicy-btn").className="menu__link";
            document.getElementById("joblistmgr").className="menu__link";
            document.getElementById("jobsubmitmgr").className="menu__link";
            document.getElementById("convertermgr").className="menu__link";
            document.getElementById("filesmanagermgr").className="menu__link";
            var sessionInfoResource = $resource(settings.URLs.apiBase + settings.URLs.sessionInfo);
            sessionInfoResource.get({}).$promise.then(function (sessionData) {
                if (sessionData.has_oauth_access_token !== "true") {
                    document.getElementById("login").style.display="block";
                    document.getElementById("logout-btn").style.display="none";
                    document.getElementById("joblistmgr").style.display="none";
                    document.getElementById("jobsubmitmgr").style.display="none";
                    document.getElementById("convertermgr").style.display="none";
                    document.getElementById("filesmanagermgr").style.display="none";
                }else{
                    document.getElementById("login").style.display="none";
                    document.getElementById("logout-btn").style.display="block";
                    document.getElementById("joblistmgr").style.display="block";
                    document.getElementById("jobsubmitmgr").style.display="block";
                    document.getElementById("convertermgr").style.display="block";
                    document.getElementById("filesmanagermgr").style.display="block";
                }
            })
        }

    ]);
