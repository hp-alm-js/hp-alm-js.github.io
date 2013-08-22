window.AlmUi = Ember.Application.create();

AlmUi.ApplicationController = Ember.Controller.extend({
    currentUser: null,
    loginUrl: 'https://qc2d.atlanta.hp.com/qcbin/rest/is-authenticated?login-form-required=y'
});

AlmUi.ApplicationView = Ember.View.extend({
  didInsertElement: function() {
    ALM.showLoginForm($('#login_frame'), function(username) {
      this.set("controller.currentUser", username);
    }, function(err) {
      this.set("controller.currentUser", null)
    });
  }
});
