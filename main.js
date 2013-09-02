var app = angular.module('AlmUi', ['$strap.directives']);

app.
  config(['$routeProvider', function($routeProvider) {
  var resolve = {
    'CurrentUser':function(LoginService){
      return LoginService.checkLogin();
    }
  };
  $routeProvider.
      when('/', {}).
      when('/home', {templateUrl: 'templates/hello.html', controller: HomeCtrl,}).
      when('/defects/my', {templateUrl: 'templates/defects.html',
                           controller: my_defects,
                           resolve:resolve
                          }).
      when('/defects/team', {templateUrl: 'templates/defects.html',
                             controller: team_defects}).
      when('/defect/:defect_id', {templateUrl: 'templates/defect.html',
                                  controller: defect})
}]);

function HomeCtrl($scope) {}

function RouteCtrl($scope, $route, $location) {
  if (['', '/'].indexOf($location.path()) != -1) {
    $location.path("/home"); 
  }
  var assignRouteVisible = function() {
    var path = $location.path(),
        routes = Object.keys($route.routes),
        buildRouteVisible = function(path) {
        return path.replace('/', '') + "Visible";
    };
    routes.map(function(el) {
       var routeVisible = buildRouteVisible(el);
       $scope[routeVisible] = false;
    });
    var routeVisible = buildRouteVisible(path);
    if(routes.indexOf(path) != -1) {
       $scope[routeVisible] = true;
    }
  };
  $scope.$on('$routeChangeSuccess', assignRouteVisible);
  assignRouteVisible();
}


app.factory('LoginService', function($q, $rootScope) {
  var checkLogin = function () {
    var deferred = $q.defer();
    ALM.tryLogin(function onLogin(username) {
      $('#login_error').hide();
      $rootScope.$apply(function () {deferred.resolve(username)});
    }, function onError(error) {
      console.log(error);
      $rootScope.$apply(function () {deferred.resolve(null)});
    });
    return deferred.promise;
  },
  login = function(username, password) {
    var deferred = $q.defer();
    ALM.login(username, password, function onLogin() {
      $rootScope.$apply(function () {deferred.resolve(true)});
    }, function onError() {
      $('#login_error').show();
      $rootScope.$apply(function () {deferred.resolve(false)});
    });
    return deferred.promise;
  },
  logout = function () {
    var deferred = $q.defer();
    ALM.logout(function() {
      $rootScope.$apply(function () {deferred.resolve()});
    });
    return deferred.promise;
  };
  return {
    checkLogin: checkLogin,
    login: login,
    logout: logout
  };
});

function appCtrl($scope, LoginService) {
  $scope.loading = true;
  ALM.config("https://qc2d.atlanta.hp.com/qcbin/", "BTO", "ETG");
  // login function
  $scope.login = function () {
    var username = $('#username').val(),
        password = $('#password').val();
    LoginService.login(username, password).then(function() {
      LoginService.checkLogin().then(function(user) {
        $scope.currentUser = user;
        $scope.loading = false;
        $('#login_form')[0].submit(); // submit to hidden frame
      });
    });
  }
  // logout function
  $scope.logout = function () {
    LoginService.logout().then(function (){
      $scope.currentUser = null;
      $("#login_form").show();
      $('#login_container').css('display', 'block');
    });
  }
  // bind current user
  LoginService.checkLogin().then(function(user) {
    $scope.currentUser = user;
    $scope.loading = false;
  });
};


app.factory('DefectsService', function($q, $rootScope) {
  return {
    getDefects: function getDefects(query) {
      var deferred = $q.defer(),
          queryString = "",
          fields = ["id","name",
                    //"description","dev-comments",
                    //"severity","attachment","detection-version",
                    //"detected-in-rel", "creation-time","owner"
                   ];
      for (property in query.query) {
        queryString += property + '["' +
                       query.query[property].join('" or "') + '"];';
      }
      ALM.getDefects(function onSuccess(defects, totalCount) {
                       $rootScope.$apply(function() {
                         deferred.resolve(defects, totalCount);
                       });
                     }, function onError() {
                       console.log('error')
                     },
                     queryString, fields);
      return deferred.promise;
    },
    getDefect: function getDefects(query) {
      var id = query.id
      var deferred = $q.defer(),
          queryString = 'id["' + id + '"]',
          fields = ["id","name","description","dev-comments",
                    "severity","attachment","detection-version",
                    "detected-in-rel", "creation-time","owner"];
      ALM.getDefects(function onSuccess(defects, totalCount) {
                       $rootScope.$apply(function() {
                         deferred.resolve(defects[0]);
                       });
                     }, function onError() {
                       console.log('error')
                     },
                     queryString, fields);
      return deferred.promise;
    }

  };
});

function my_defects($scope, CurrentUser, DefectsService) {
  var query = { owner: [CurrentUser], status: ['Open', 'New'] };
  $scope.header = "My defects";
  $scope.loading = true;
  DefectsService.getDefects({query: query}).then(function(defects) {
    $scope.loading = false;
    $scope.defects = defects;
  });
}

function team_defects($scope, DefectsService) {
  // TODO find a way to remove this hard-coded team name
  var query = { "user-95": ["DDM Content"], status: ['Open', 'New'], severity: ["2 - High", "1 - Urgent"] };
  $scope.header = "Team defects";
  $scope.loading = true;
  DefectsService.getDefects({query: query}).then(function(defects) {
    $scope.loading = false;
    $scope.defects = defects;
  });

}

function defect($scope, DefectsService, $routeParams) {
  $scope.loading = true;
  DefectsService.getDefect({id: $routeParams.defect_id}).then(function(defect) {
    $scope.loading = false;
    $scope.defect = defect;
  });

}
