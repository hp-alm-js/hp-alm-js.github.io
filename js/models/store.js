AlmUi.MyFixtureAdapter = DS.FixtureAdapter.extend({
  queryFixtures: function(fixtures, query, type) {
    return fixtures.filter(function(item) {
      for(prop in query.query) {
        if(query.query[prop].indexOf(item[prop]) == -1) {
          return false;
        }
      }
      return true;
    });
  }
});

AlmUi.AlmAdapter = DS.Adapter.extend({
  createRecord: function() {
  },
  updateRecord: function() {
  },
  deleteRecord: function() {
  },
  findAll: function(store, type) {
    var that = this;
    ALM.getUsers(function onSuccess(users) {
      that.didFindAll(store, type, {'users': users});
    }, function onError() {
        console.log()
    });
  },
  find: function(store, type, id) {
    var that = this;
    var queryString = 'id["' + id + '"]';
    var fields = ["id","name","description","dev-comments","severity","attachment","detection-version","detected-in-rel", "creation-time","owner"];
    ALM.getDefects(function onSuccess(defects) {
      that.didFindRecord(store, type, {'defect': defects[0]}, id);
    }, function onError() {console.log('error')}, queryString, fields);
  },
  findQuery: function(store, type, query, array) {
    var that = this,
        queryString = "",
        fields = ["id","name","description","dev-comments","severity","attachment", "detection-version","detected-in-rel", "creation-time","owner"];
    for (property in query.query) {
      queryString += property + '["' +
                     query.query[property].join('" or "') + '"];';
    }
    ALM.getDefects(function onSuccess(defects, totalCount) {
      that.didFindQuery(store, type, {'defects': defects}, array);
    }, function onError() {console.log('error')}, queryString, fields);
  }
});

AlmUi.Store = DS.Store.extend({
  adapter: AlmUi.AlmAdapter
});

