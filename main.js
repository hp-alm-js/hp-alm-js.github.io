var app = angular.module('AlmUi', ['$strap.directives']);

app.
  config(['$routeProvider', function($routeProvider) {
  var resolve = {
    'CurrentUser':function(LoginService){
      return LoginService.checkLogin();
    },
    'Users': function(UsersService) {
      return UsersService.getUsers();
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
                                  controller: defect,
                                  resolve:resolve
                                 })
}]);

app.directive('contenteditable', function() {
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel',
    link: function(scope, element, attrs, ngModel) {
      if(!ngModel) return; // do nothing if no ng-model

      // model -> view
      ngModel.$render = function() {
        element.html(ngModel.$viewValue);
      };
      // view -> model
      element.on('blur keyup change', function() {
        scope.$apply(read);
      });
      read(); // initialize

      // Write data to the model
      function read() {
        var html = element.html();
        // When we clear the content editable the browser leaves a <br> behind
        // If strip-br attribute is provided then we strip this out
        if( attrs.stripBr && html == '<br>' ) {
          html = '';
        }
        ngModel.$setViewValue(html);
      }
    }
  };
});

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

app.factory('UsersService', function($q, $rootScope) {
  return {
    getUsers: function getUsers(username, password) {
      var deferred = $q.defer();
      ALM.getUsers(function cb(users) {
          $rootScope.$apply(function () {deferred.resolve(users)});
        }, function onError() {
          $rootScope.$apply(function () {deferred.resolve([])});
        });
      return deferred.promise;
    },
  };
});

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
  ALM.config("http://qc2d.atlanta.hp.com/qcbin/", "BTO", "ETG");
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
                    "user-69", "creation-time","owner"];
      ALM.getDefects(function onSuccess(defects, totalCount) {
                       $rootScope.$apply(function() {
                         deferred.resolve(defects[0]);
                       });
                     }, function onError() {
                       console.log('error')
                     },
                     queryString, fields);
      return deferred.promise;
    },
    saveDefect: function saveDefect(defect, lastSavedDefect) {
      var deferred = $q.defer();
      ALM.saveDefect(
        function onSave() {
          deferred.resolve();
          $rootScope.$apply();
        },
        function onError(error) {
          deferred.reject(error);
          $rootScope.$apply();
        },
        defect, lastSavedDefect
      );
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

function defect($scope, DefectsService, Users, $routeParams) {
  $scope.loading = true;
  DefectsService.getDefect({id: $routeParams.defect_id}).then(function(defect) {
    $scope.loading = false;
    $scope.defect = defect;
    $scope.last_saved_defect = angular.copy(defect);
    $scope.users = Users;
    $scope.filterUsers = function (user) {
        if(!$scope.filter) {return true;}
        //if (user.name == $scope.defect.owner) {return true;}
        if (user.fullname.toLowerCase().indexOf($scope.filter.toLowerCase()) != -1) {
          return true;
        }
    };
    $scope.getFullName = function(name) {
      var users = $scope.users;
      for (var i = 0; i < users.length; ++i) {
        if(users[i].name == name) {
          return users[i].fullname;
        }
      }
    };
    $scope.select = function(username) {
      $scope.defect.owner = username;
      $scope.filter = "";
      $scope.showBox = false;
    };
    $scope.showUsers = function(event) {
      $scope.showBox = !$scope.showBox;
    };
    $scope.saveEnabledClass = function() {
      var changed = ALM.getChanged($scope.last_saved_defect, $scope.defect);
      if (Object.keys(changed).length === 0) {
        return 'disabled';
      }
      return '';
    };
    $scope.save = function() {
      DefectsService.saveDefect($scope.defect, $scope.last_saved_defect).then(function onSave() {
        $scope.last_saved_defect = angular.copy($scope.defect);
      }, function onError(error) {
        $scope.errorMessage = error;
        console.log(error);
      });
    };
  });

}
