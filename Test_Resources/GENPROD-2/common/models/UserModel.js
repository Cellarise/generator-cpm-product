"use strict";
var config = require('../../server/config');
var debug = require('debug')('loopback:userModel');
var vasync = require('vasync');
var _ = require('underscore');

module.exports = function userModel(UserModel) {

  UserModel.changePassword = function changePassword(credentials, next) {
    //verify passwords match
    if (!credentials.body.password
      || !credentials.body.confirmPassword
      || credentials.body.password !== credentials.body.confirmPassword) {
      return next(new Error('Passwords do not match'));
    }
    if (credentials.body.password.length < 6) {
      return next(new Error('Password must be greater than 5 characters'));
    }
    vasync.waterfall([
      function getUser(cb) {
        UserModel.findById(credentials.accessToken.userId, cb);
      },
      function updatePassword(user, cb) {
        user.updateAttribute('password', credentials.body.password, cb);
      }
    ], function end(err) {
      if (err) {
        return next(err);
      }
      debug('> password reset processed successfully');
      return next(err, {
        "message": "Password reset successful."
      });
    });
  };

  UserModel.remoteMethod(
    'changePassword',
    {
      "description": 'Change password',
      "accepts": [
        {"arg": 'credentials', "type": 'object', "required": true, "http": {"source": 'req'}}
      ],
      "returns": {
        "arg": 'message', "type": 'object', "root": true,
        "description": 'The response body contains success message.\n'
      },
      "http": {"verb": 'post'}
    }
  );

  UserModel.validate = function validate(credentials, next) {
    return next(null, credentials.accessToken);
  };

  UserModel.remoteMethod(
    'validate',
    {
      "description": 'Validate access_token',
      "accepts": [
        {"arg": 'credentials', "type": 'object', "required": true, "http": {"source": 'req'}}
      ],
      "returns": {
        "arg": 'message', "type": 'object', "root": true,
        "description": 'The response body contains success message.\n'
      },
      "http": {"verb": 'post'}
    }
  );

  //send verification email after registration
  UserModel.afterRemote('create', function create(context, user1, next) {
    var url = 'https://' + config.externalHost + '/#page=user/verified';
    var options = {
      "type": 'email',
      "to": user1.email,
      "from": "noreply-" + config.applicationName + "-" + config.externalHost + "@cellarise.com",
      "subject": 'Thanks for registering.',
      //"redirect": '/verified',
      "verifyHref": url,
      "user": user1
    };
    debug('> user.afterRemote triggered');
    user1.verify(options, function verify(err, response) {
      if (err) {
        return next(err);
      }
      debug('> verification email sent: %s', response);
      return next();
    });
  });

  UserModel.getMappedRoles = function getMappedRoles(token, cb) {
    UserModel.app.models.RoleMapping.find({"where": {"principalId": token.userId}}, function roleMappings(err, result) {
      var funcArr;
      if (err) {
        debug('An error is reported from UserModel.getMappedRoles: %j', err);
        return cb(err);
      }
      funcArr = _.map(result, function mapGetRoles(item) {
        return function getRoles(callback) {
          UserModel.app.models.Role.find({"where": {"id": item.roleId}}, callback);
        };
      });
      vasync.parallel({"funcs": funcArr}, function end(err1, result1) {
        var roles;
        if (err1) {
          debug('An error is reported from UserModel.getMappedRoles: %j', err1);
          return cb(err1);
        }
        roles = _.map(result1.operations, function convertResultset(res) {
          return res.result[0];
        });
        debug('> getMappedRoles processed successfully');
        if (roles.length === 1) {
          return cb(err1, [roles]);
        }
        return cb(err1, roles);
      });
    });
  };

  UserModel.tokenAccountWrapper = function tokenAccountWrapper(context, token, next) {
    vasync.parallel({
      "funcs": [
        function getUser(cb) {
          UserModel.find({"where": {"id": token.userId}}, cb);
        },
        function getRole(cb) {
          UserModel.getMappedRoles(token, cb);
        },
        function accountUserMapping(cb) {
          UserModel.app.models.accountUserMapping.findAccount(token, cb);
        },
        function getCustomerAccount(cb) {
          UserModel.app.models.CustomerAccountUserMapping.find({
            "where": {"userModelId": token.userId},
            "include": "customerAccount",
            "tSQLJoin": {
              "model": "CustomerAccount",
              "fromColumn": "customerAccountId",
              "toColumn": "id"
            }
          }, cb);
        },
        function getPartnerAccount(cb) {
          UserModel.app.models.PartnerAccountUserMapping.find({
            "where": {"userModelId": token.userId},
            "include": "partnerAccount",
            "tSQLJoin": {
              "model": "PartnerAccount",
              "fromColumn": "partnerAccountId",
              "toColumn": "id"
            }
          }, cb);
        },
        function getOperationsAccount(cb) {
          UserModel.app.models.OperationsAccountUserMapping.find({
            "where": {"userModelId": token.userId},
            "include": "operationsAccount",
            "tSQLJoin": {
              "model": "OperationsAccount",
              "fromColumn": "operationsAccountId",
              "toColumn": "id"
            }
          }, cb);
        }
      ]
    }, function end(err, result) {
      var operations = result.operations;
      var encloseSingleRowInArray = function encloseSingleRowInArray(row) {
        if (_.isArray(row) || !row) {
          return row;
        }
        return [row];
      };
      if (err) {
        debug('An error is reported from UserModel.tokenAccountWrapper: %j', err);
        return next(err);
      }
      debug('> tokenAccountWrapper processed successfully');
      context.result = {
        "access_token": token,
        "user": operations[0].result[0],
        "roles": operations[1].result[0],
        "accounts": operations[2].result[0],
        "customerAccounts": encloseSingleRowInArray(operations[3].result),
        "partnerAccounts": encloseSingleRowInArray(operations[4].result),
        "operationsAccounts": encloseSingleRowInArray(operations[5].result)
      };
      return next(err);
    });
  };
  //Add user account details
  UserModel.afterRemote('login', UserModel.tokenAccountWrapper);
  UserModel.afterRemote('validate', UserModel.tokenAccountWrapper);

  //send password reset link when requested
  UserModel.on('resetPasswordRequest', function onResetPasswordRequest(info) {
    var url = 'https://' + config.externalHost + '/#page=user/resetPassword';
    var html = 'Click <a href="' + url + '&access_token=' + info.accessToken.id + '">here</a> to reset your password';

    UserModel.app.models.Email.send({
      "to": info.email,
      "from": "noreply-" + config.applicationName + "-" + config.externalHost + "@cellarise.com",
      "subject": 'Password reset',
      "html": html
    }, function cb(err) {
      if (err) {
        return debug('> error sending password reset email');
      }
      return debug('> sending password reset email to: %s', info.email);
    });
  });
};
