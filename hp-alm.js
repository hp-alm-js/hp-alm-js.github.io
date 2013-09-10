(function() {

var API_URL = "";
var DOMAIN = "";
var PROJECT = "";
var ALM = {};
window.ALM = ALM;

ALM.config = function(apiUrl, domain, project) {
    API_URL = apiUrl;
    DOMAIN = domain;
    PROJECT = project;
}

ALM.onResponse = function onResponse(response, cb, errCb) {
    var jsonResponse;
    try {
        jsonResponse = $.xml2json(response);
    }
    catch(err) {
        if (errCb) {
            errCb("error during parsing xml:" + err)
        }
    }
    if (jsonResponse) {
        cb(jsonResponse);
    }
}

ALM.ajax = function ajax(path, onSuccess, onError, type, data, contentType) {
    $.ajax(API_URL + path, {
        success: function (response) {
            ALM.onResponse(response, onSuccess, onError);
        },
        error: onError,
        xhrFields: {
            withCredentials: true
        },
        type: type,
        data: data,
        contentType: contentType
    });
};

ALM.login = function (username, password, onSuccess, onError) {
    ALM.ajax('authentication-point/j_spring_security_check', onSuccess, onError, 'POST', {
        'j_username': username,
        'j_password': password
    });
}

ALM.tryLogin = function tryLogin(onLogin, onError) {
    ALM.ajax("rest/is-authenticated?login-form-required=y", function(response) {
        onLogin(response.Username);
    },
    function(err) {
        onError(err);
    });
}

ALM.logout = function logout(cb) {
    ALM.ajax("authentication-point/logout", cb, function err(){});
}

function convertFields(entities) {
    if (!(entities instanceof Array)) {
        entities = [entities];
    }
    return entities.map(function (entity) {
        var entityObj = entity.Fields.Field.reduce(function(prev, current) {
            prev[current.Name] = current.Value;
            return prev;
        }, {});
        return entityObj;
    });
}

  function convertFieldsBack(entity, type) {
    var start = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>' +
        '<Entity Type="' + type + '">' + '<Fields>',
        middle = '',
        end = '</Fields></Entity>';
    for (var fieldName in entity) {
      middle += '<Field Name="' + fieldName +'">' +
        '<Value>' + escapeXml(entity[fieldName]) + '</Value></Field>';
    }
    return start + middle + end;
  }

  function escapeXml (s) {
    var XML_CHAR_MAP = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;'
    };

    return s.replace(/[<>&"']/g, function (ch) {
      return XML_CHAR_MAP[ch];
    });
  }

ALM.getDefectAttachments = function getDefectAttachments(defectId, cb, errCb) {
    var path = "rest/domains/" + DOMAIN +
               "/projects/" + PROJECT +
               "/defects/" + defectId + "/attachments";
    ALM.ajax(path, function onSuccess(attachmentsJSON) {
        var attachments = convertFields(attachmentsJSON.Entity);
        var buildAttachmentUrl = function(attachment) {
            attachment.url = API_URL + path + "/"  + attachment.name;
        }
        attachments.map(buildAttachmentUrl);
        cb(attachments);
    });
}

ALM.getUsers = function getUsers(cb, errCb) {
    var path = "rest/domains/" + DOMAIN +
               "/projects/" + PROJECT +
               "/customization/users";
    ALM.ajax(path, function onSuccess(usersJSON) {
        var users = usersJSON.User.map(function(el) {
            return {
                name: el.Name,
                fullname: el.FullName,
                email: el.email,
                phone: el.phone,
            };
        })
        cb(users);
    });
}

ALM.getDefects = function getDefects(cb, errCb, query, fields) {
    var computedFields = ["has-others-linkage", "has-linkage", "alert-data"],
        fieldsParam = null;
    if (!fields) {
        fields = ["id","name","description","dev-comments","severity","attachment"];
    }
    fields = fields.filter(function(field) {return computedFields.indexOf(field) == -1;})
    fieldsParam = 'fields=' + fields.join(',') + '&';
    var queryParam = "query={" + query + "}&";
    var path = "rest/domains/" + DOMAIN +
               "/projects/" + PROJECT +
               "/defects?" + queryParam + fieldsParam;
    ALM.ajax(path, function onSuccess(defectsJSON) {
        var defectsCount = defectsJSON.TotalResults;
        var defects = convertFields(defectsJSON.Entity);
        cb(defects, defectsCount);
    }, errCb);
}

ALM.getChanged = function getChanged(oldDefect, newDefect) {
  var changed = {};
  for (var field in newDefect) {
    if (newDefect[field] != oldDefect[field] &&
        typeof(newDefect[field]) != 'object' &&
        oldDefect[field] != undefined
        ) {
      changed[field] = newDefect[field];
    }
  }
  return changed;
};

ALM.saveDefect = function saveDefect(cb, errCb, defect, lastSavedDefect) {
  var error = null,
      defectUrl = "rest/domains/" + DOMAIN +
            "/projects/" + PROJECT +
            "/defects/" + defect.id,
      start = function start() {
        lock();
      },
      lock = function lock() {
        verify(); // TODO locking error -> afterUnlock
      },
      verify = function verify() {
        var fields = Object.keys(defect);
        ALM.getDefects(function onSuccess(defects) {
          var oldDefect = defects[0], newDefect = defect,
              changedFields = ALM.getChanged(oldDefect, newDefect),
              hasNoConflicts = Object.keys(ALM.getChanged(oldDefect,
                                                          lastSavedDefect)).length == 0;
          // verify the latest version to prevent conflicts
          if (hasNoConflicts) {
            save(changedFields);
          } else {
            error = "There was an editing conflict! Please refresh";
            unlock();
          }
        }, function onError(checkoutError) {
          error = checkoutError;
          unlock();
        }, "id[" + defect.id + "]", fields);
      },
      save = function save(changedFields) {
        // actual save
        var path = defectUrl,
            xml = convertFieldsBack(changedFields, 'defect');
        ALM.ajax(path, function onSuccess() {
          unlock(); // always unlock after save
        }, function onError(saveError) {
          error = saveError;
          unlock(); // always unlock after error
        }, 'PUT', xml, 'application/xml');
      },
      unlock = function unlock() {
        afterUnlock();
      },
      afterUnlock = function afterUnlock() {
        if (error) {
          errCb(error);
        } else {
          cb();
        }
      };
  start();
}

})();
