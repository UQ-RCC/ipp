'use strict';

angular.module('microvolution.services')
  .factory('TokenHandler', function () {
    var tokenHandler = {};
    var token = "none";
    tokenHandler.set = function (newToken) {
      token = newToken;
    };
    tokenHandler.get = function () {
      return token;
    };

    tokenHandler.getHeader = function () {
      return 'Bearer ' + token;
    };

    // Wrap a configuration with an Authorization header
    tokenHandler.wrapConfig = function (config) {
      config.headers = config.headers || {}
      angular.extend(config.headers, config.headers, { Authorization: tokenHandler.getHeader });
      return config;
    };

    // Wrap a configuration with an Authorization header
    tokenHandler.wrapConfig = function (config) {
      config.headers = config.headers || {}
      angular.extend(config.headers, config.headers, { Authorization: tokenHandler.getHeader });
      return config;
    };

    return tokenHandler;
  })
  .factory('SessionInfoFactory', ['$resource', 'settings', function ($resource, settings) {
    return $resource(settings.URLs.apiBase + settings.URLs.sessionInfo, {}, {
      get: { method: 'GET', isArray: false }
    })
  }])
  .factory('EndSessionFactory', ['$resource', 'settings', function ($resource, settings) {
    return $resource(settings.URLs.apiBase + settings.URLs.logout, {}, {
      get: { method: 'GET', isArray: false }
    })
  }])
  .factory('AccessTokenFactory', ['$resource', 'settings', function ($resource, settings) {
    return $resource(settings.URLs.apiBase + settings.URLs.accessToken, {}, {
      get: { method: 'GET', isArray: false }
    })
  }])
  .factory('UserPreferenceFactory', ['$resource', 'settings', function ($resource, settings) {
    return $resource(settings.URLs.apiBase + 'preference/wiener', {}, {
      get: { method: 'GET', isArray: false },
      update: { method: 'PUT', isArray: false }
    })
  }])
  .factory('UserHomeFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.home, {}, {
      query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });
    return resource;
  }])
  .factory('ListFolderFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.listFolderBase64, {}, {
      query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });
    return resource;
  }])
  .factory('ListTemplateFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.listTemplate, {}, {
      query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });
    return resource;
  }])
  .factory('FileInfoFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.fileInfoBase64, {}, {
      query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });
    return resource;
  }])
  .factory('FilesInfoFactory', ['$resource', 'TokenHandler', 'settings', function ($resource, tokenHandler, settings) {
    var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.filesInfoBase64, {}, {
      query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
    });
    return resource;
  }])
  .factory('FolderInfoFactory', ['$resource', 'TokenHandler', 'settings',
    function ($resource, tokenHandler, settings) {
      var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.folderInfoBase64, {}, {
        query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
      });
      return resource;
    }])
  .factory('LoadTemplateFactory', ['$resource', 'TokenHandler', 'settings',
    function ($resource, tokenHandler, settings) {
      var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.loadTemplate, {}, {
        query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
      });
      return resource;
    }])
  .factory('SaveTemplateFactory', ['$resource', 'TokenHandler', 'settings',
    function ($resource, tokenHandler, settings) {
      var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.saveTemplateBase64, {}, {
        query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
      });
      return resource;
    }])
  .factory('ExecuteJobFactory', ['$resource', 'TokenHandler', 'settings',
    function ($resource, tokenHandler, settings) {
      var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.executeMicrovolutionBase64, {}, {
        query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
      });
      return resource;
    }])
  .factory('ListJobsFactory', ['$resource', 'TokenHandler', 'settings',
    function ($resource, tokenHandler, settings) {
      var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.listJobs, {}, {
        query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
      });
      return resource;
    }])
  .factory('StopJobsFactory', ['$resource', 'TokenHandler', 'settings',
    function ($resource, tokenHandler, settings) {
      var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.stop, {}, {
        stop: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
      });
      return resource;
    }])
  .factory('ConverterFactory', ['$resource', 'TokenHandler', 'settings',
    function ($resource, tokenHandler, settings) {
      var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.convertFileBase64, {}, {
        query: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
      });
      return resource;
    }])
  .factory('DeleteFilesFactory', ['$resource', 'TokenHandler', 'settings',
    function ($resource, tokenHandler, settings) {
      var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.deleteBase64, {}, {
        delete: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
      });
      return resource;
    }])
  .factory('CopyFilesFactory', ['$resource', 'TokenHandler', 'settings',
    function ($resource, tokenHandler, settings) {
      var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.copyBase64, {}, {
        copy: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
      });
      return resource;
    }])
  .factory('MoveFilesFactory', ['$resource', 'TokenHandler', 'settings',
    function ($resource, tokenHandler, settings) {
      var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.moveBase64, {}, {
        move: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
      });
      return resource;
    }])
  .factory('ListCopyingProcessFactory', ['$resource', 'TokenHandler', 'settings',
    function ($resource, tokenHandler, settings) {
      var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.listCopyingProcess, {}, {
        list: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
      });
      return resource;
    }])
  .factory('PreprocessFactory', ['$resource', 'TokenHandler', 'settings',
    function ($resource, tokenHandler, settings) {
      var resource = $resource(settings.URLs.resourceApiBase + settings.URLs.preprocess, {}, {
        process: tokenHandler.wrapConfig({ method: 'GET', isArray: false }),
      });
      return resource;
    }])
  ;
