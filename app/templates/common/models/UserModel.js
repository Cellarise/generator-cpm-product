"use strict";
var config = require('../../server/config');
var debug = require('debug')('loopback:userModel');
var vasync = require('vasync');
var R = require('ramda');

module.exports = function userModel(UserModel) {
  var DEFAULT_RESET_PW_TTL = 15 * 60; // 15 mins in seconds
  var remoteHooks = {
    "before": {
      "create": function create(ctx, _undefModel, next) {
        var body = ctx.req.body;
        this.passwordsCheck(body, function cb(err) {
          next(err);
        });
      },
      "upsert": function upsert(ctx, _undefModel, next) {
        var body = ctx.req.body;
        if (body.hasOwnProperty('changePassword') || body.hasOwnProperty('password')) {
          this.updatePassword(ctx, _undefModel, next);
        }
        if (!body.hasOwnProperty('changePassword')) {
          next();
        }
      },
      "updatePassword": function updatePassword(ctx, _undefModel, next) {
        var body = ctx.req.body;
        var accessToken = ctx.req.accessToken;
        vasync.waterfall([
          function passwordCheck(cb) {
            this.passwordsCheck(body, cb);
          }.bind(this),
          function getUser(cb) {
            if (accessToken.ttl > DEFAULT_RESET_PW_TTL) {
              //must provide a password
              if (!body.hasOwnProperty('password')) {
                debug('accessToken ttl: ' + accessToken.ttl);
                return cb(new Error('Cannot reset password from this session. Use change password.'));
              }
              //get user record to check password
              UserModel.findById(accessToken.userId, cb);
            } else {
              cb(null, null);
            }
          },
          function checkPasswordIfRequired(user, cb) {
            if (user) {
              user.hasPassword(body.password, function cb1(err, match) {
                if (err || !match) {
                  return cb(new Error('The current password is invalid'));
                }
                cb();
              });
            } else {
              cb();
            }
          }
        ], function end(err) {
          body.password = body.changePassword;
          delete body.changePassword;
          delete body.changePasswordConfirm;
          next(err);
        });
      },
      "passwordsCheck": function passwordsCheck(body, cb) {
        if (!body.hasOwnProperty('changePasswordConfirm')
          || body.changePassword !== body.changePasswordConfirm) {
          return cb(new Error('Passwords do not match'));
        }
        if (body.changePassword.length < 7) {
          return cb(new Error('Password must be greater than 6 characters'));
        }
        return cb();
      }
    },
    "after": {
      "create": function create(context, user1, next) {
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
      },
      "tokenAccountWrapper": function tokenAccountWrapper(context, token, next) {
        vasync.parallel({
          "funcs": [
            function getUser(cb) {
              UserModel.find({"where": {"id": token.userId}}, cb);
            },
            function getRole(cb) {
              this.getMappedRoles(token, cb);
            }.bind(this),
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
            },
            function getContractorAccount(cb) {
              UserModel.app.models.ContractorAccountUserMapping.find({
                "where": {"userModelId": token.userId},
                "include": "contractorAccount",
                "tSQLJoin": {
                  "model": "ContractorAccount",
                  "fromColumn": "contractorAccountId",
                  "toColumn": "id"
                }
              }, cb);
            }
          ]
        }, function end(err, result) {
          var operations = result.operations;
          var encloseSingleRowInArray = function encloseSingleRowInArray(row) {
            if (R.is(Array, row) || !row) {
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
            "customerAccounts": encloseSingleRowInArray(operations[2].result),
            "partnerAccounts": encloseSingleRowInArray(operations[3].result),
            "operationsAccounts": encloseSingleRowInArray(operations[4].result),
            "contractorAccounts": encloseSingleRowInArray(operations[5].result)
          };
          return next(err);
        });
      },
      "getMappedRoles": function getMappedRoles(token, cb) {
        UserModel.app.models.RoleMapping.find({"where": {"principalId": token.userId}},
          function roleMappings(err, result) {
            var funcArr;
            if (err) {
              debug('An error is reported from UserModel.getMappedRoles: %j', err);
              return cb(err);
            }
            funcArr = R.map(function mapGetRoles(item) {
              return function getRoles(callback) {
                UserModel.app.models.Role.find({"where": {"id": item.roleId}}, callback);
              };
            }, result);
            vasync.parallel({"funcs": funcArr}, function end(err1, result1) {
              var roles;
              if (err1) {
                debug('An error is reported from UserModel.getMappedRoles: %j', err1);
                return cb(err1);
              }
              roles = R.map(function convertResultset(res) {
                return res.result[0];
              }, result1.operations);
              debug('> getMappedRoles processed successfully');
              if (roles.length === 1) {
                return cb(err1, [roles]);
              }
              return cb(err1, roles);
            });
          });
      }
    },
    "on": {
      "resetPasswordRequest": function resetPasswordRequest(info) {
        var url = config.externalURL.url + '/#page=user/resetPassword';
        var html = 'Click <a href="' + url + '&access_token=' + info.accessToken.id
          + '">here</a> to reset your password';

        UserModel.app.models.Email.send({
          "to": info.email,
          "from": "noreply-" + config.applicationName + "-" + config.externalURL.host + "@cellarise.com",
          "subject": 'Password reset',
          "html": html
        }, function cb(err) {
          if (err) {
            return debug('> error sending password reset email');
          }
          return debug('> sending password reset email to: %s', info.email);
        });
      }
    }
  };

  UserModel.reauthorise = function reauthorise(credentials, next) {
    return next(null, credentials.accessToken);
  };
  UserModel.remoteMethod('reauthorise', {
    "description": 'Reauthorise access_token',
    "accepts": [
      {"arg": 'credentials', "type": 'object', "required": true, "http": {"source": 'req'}}
    ],
    "returns": {
      "arg": 'message', "type": 'object', "root": true,
      "description": 'The response body contains success message.\n'
    },
    "http": {"verb": 'post'}
  });

  UserModel.beforeRemote('create', function wrap() {
    return remoteHooks.before.create.apply(remoteHooks.before, arguments);
  });
  UserModel.beforeRemote('upsert', function wrap() {
    return remoteHooks.before.upsert.apply(remoteHooks.before, arguments);
  });
  UserModel.afterRemote('create', function wrap() {
    return remoteHooks.after.create.apply(remoteHooks.after, arguments);
  });
  UserModel.afterRemote('login', function wrap() {
    return remoteHooks.after.tokenAccountWrapper.apply(remoteHooks.after, arguments);
  });
  UserModel.afterRemote('reauthorise', function wrap() {
    return remoteHooks.after.tokenAccountWrapper.apply(remoteHooks.after, arguments);
  });
  UserModel.on('resetPasswordRequest', function wrap() {
    return remoteHooks.on.resetPasswordRequest.apply(remoteHooks.on, arguments);
  });
}
;
