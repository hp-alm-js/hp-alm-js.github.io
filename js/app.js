window.AlmUi = Ember.Application.create();

Ember.Application.initializer({
  name: "initializerALM",
  initialize: function(container, application) {
    ALM.config("https://qc2d.atlanta.hp.com/qcbin/", "BTO", "ETG");
  },
});

AlmUi.ApplicationController = Ember.Controller.extend({
  currentUser: null,
  checkLogin: function() {
    var that = this;

    var checkLoginPromise = new Ember.RSVP.Promise(function(resolve, reject){
      var promise = this;
      if (that.get('currentUser')) {
        resolve(username);
      } else {
        ALM.tryLogin(function onLogin(username) {
          that.set("currentUser", username);
          $('#login_form').hide();
          $('#login_error').hide();
          resolve(username);
        }, function onError() {
          console.log('eeee')
          that.set("currentUser", null);
          $('#login_container').css('display', 'block');
          reject(null);
        });
      }
    });
    return checkLoginPromise;
  },
  login: function(form, username, password) {
    var that = this;
    ALM.login(username, password, function onLogin() {
      that.checkLogin().then(function() {});
    }, function onError() {
      $('#login_error').show();
    });
    return true;
  },
  logout: function () {
    var that = this;
    ALM.logout(function() {
      that.set("currentUser", null);
      $("#login_form").show();
    });
  },
  init: function() {
  }
});

AlmUi.ApplicationView = Ember.View.extend({
  didInsertElement: function() {
    var that = this;
    $("#login_form").submit(function( event ) {
      var form = $(this);
      var username = $('#username').val(),
          password = $('#password').val();
      form[0].submit(); // submit to hidden frame
      that.get("controller").login(form, username, password);
    });
    that.get("controller").checkLogin().then();
  }
});
