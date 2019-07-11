'use strict';

angular.module('microvolution.landingpage', [])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/landingpage', {
            templateUrl: 'landingpage/landingpage.html',
            controller: 'LandingPageCtrl'
        });
    }])

    .controller('LandingPageCtrl', ['SessionInfoFactory',
        function (SessionInfoFactory) {
            document.getElementById("home-btn").className="menu__link active";
            document.getElementById("contact-btn").className="menu__link";
            document.getElementById("faq-btn").className="menu__link";
            document.getElementById("joblistmgr").className="menu__link";
            document.getElementById("jobsubmitmgr").className="menu__link";
            document.getElementById("convertermgr").className="menu__link";
            document.getElementById("filesmanagermgr").className="menu__link";
            SessionInfoFactory.get({}).$promise.then(function (sessionData) {
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
