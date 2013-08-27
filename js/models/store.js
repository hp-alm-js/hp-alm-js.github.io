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
  find: function(store, type, id) {
    var that = this;
    var queryString = 'id["' + id + '"]';
    ALM.getDefects(function onSuccess(defects) {
      that.didFindRecord(store, type, {'defect': defects[0]}, id);
    }, function onError() {console.log('error')}, queryString);
  },
  findQuery: function(store, type, query, array) {
    var that = this,
        queryString = "";
    for (property in query.query) {
      queryString += property + '["' +
                     query.query[property].join('" or "') + '"];';
    }
    ALM.getDefects(function onSuccess(defects, totalCount) {
      that.didFindQuery(store, type, {'defects': defects}, array);
    }, function onError() {console.log('error')}, queryString);
  }
});

AlmUi.Store = DS.Store.extend({
  adapter: AlmUi.AlmAdapter
});

