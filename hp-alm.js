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

ALM.ajax = function ajax(path, onSuccess, onError) {
    $.ajax(API_URL + path, {
        success: function (response) {
            var response;
            try {
                response = $.xml2json(response);
            }
            catch(err) {
                if (onError) {
                    onError(err)
                }
            }
            if (response) { 
                onSuccess(response);
            }
        },
        error: onError,
        xhrFields: {
            withCredentials: true
        }
    });
};

ALM.showLoginForm = function showLoginForm(loginForm, onLogin, onError) {
    loginForm.attr('src', API_URL + 'rest/is-authenticated?login-form-required=y');
    loginForm.load(function(ev) {
        tryLogin(onLogin, onError);
    });
    function tryLogin(onLogin, onError) {
        ALM.ajax("rest/is-authenticated?login-form-required=y", function(response) {
            onLogin(response.Username);
        },
        function(err) {
            onError(err);
        });
    }
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

ALM.getDefects = function getDefects(cb, errCb, query) {
    var fields = ["id","name","description","dev-comments","severity","attachment"];
    var fieldsParam = "fields="+ fields.join(",") + "&";
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

})();
