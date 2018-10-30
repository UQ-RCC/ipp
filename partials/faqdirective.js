/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

angular
        .module('microvolution.faqdirectives', [])
        .directive('faqcontent', function () {
            var directive = {};
            directive.restrict = 'E';
            directive.replace = 'true';
            directive.templateUrl = 'partials/faqcontent.html';

            directive.compile = function () {
                var linkfunction = function () {
                    $('.faqquestions').click(function(event) {
                        event.preventDefault();

                       $('div.panel-collapse').attr('class','panel-collapse collapse');

                        var target = "#" + this.getAttribute('data-target');
                        $(target).addClass('in');
                        $('html, body').animate({
                            scrollTop: $(target).offset().top
                        }, 2000);
                    });

                }

                return linkfunction;
            }

            return directive;
        });

