"use strict";
var vasync = require("vasync");
var R = require('ramda');
var DataLoader = require("../scripts/dataLoader");
var checkEnv = require('../scripts/checkEnvironment');
var debug = require('debug')('loopback:dataLoad');
module.exports = function dataLoad(app, cb) {
  var users;
  var roles;
  var vehicleComponentTypes;
  if (checkEnv.isNonDevEnvironment()) {
    debug('04 data load - skipped');
    cb();
    /*
    vasync.pipeline({
      'funcs': [
        function func11(_, callback) {
          app.models.UserModel.create({
            "name": 'Tonia Bergmanis',
            "email": 'Tonia.Bergmanis@infrastructure.gov.au',
            "password": "5201#infraTB"
          }, function (err, user) {
            if (err) {
              throw err;
            }
            users = [];
            users.push(user);
            console.log('04 data load - UserModel table');
            callback();
          });
        },
        function func5(_, callback) {
          app.models.PartnerAccountUserMapping.create([{
            "partnerAccountId": "RMQLD1",
            "userModelId": users[0].id,
            "role": 'User'
          }], function (err5) {
            if (err5) {
              throw err5;
            }
            console.log('04 data load - accountUserMappings table');
            callback();
          });
        },
        function func5(_, callback) {
          app.models.accountUserMapping.create([{
            "accountId": 1,
            "userId": users[0].id,
            "role": 'User'
          }], function (err5) {
            if (err5) {
              throw err5;
            }
            console.log('04 data load - accountUserMappings table');
            callback();
          });
        },
        function func12(_, callback) {
          app.models.RoleMapping.create({
            "principalType": app.models.RoleMapping.USER,
            "principalId": users[0].id,
            "roleId": 1
          }, function (err) {
            if (err) {
              throw err;
            }
            //users.push(user);
            console.log('04 data load - Role table');
            callback();
          });
        }
      ]
    }, function (err) {
      if (err) {
        console.log('error: %s', err.message);
      }
      console.log('04 data load - complete');
      cb();
    });*/
  } else {
    vasync.pipeline({
      'funcs': [
        function operationsAccountModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "OperationsAccount",
            require("../../Test_Resources/QA/Data/OperationsAccount.json"));
          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function contractorAccountModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "ContractorAccount",
            require("../../Test_Resources/QA/Data/ContractorAccount.json"));
          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function customerAccountModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "CustomerAccount",
            require("../../Test_Resources/QA/Data/CustomerAccount.json"));
          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function partnerAccountModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "PartnerAccount",
            require("../../Test_Resources/QA/Data/PartnerAccount.json"));
          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function customerCaseModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "CustomerCase", require("../../Test_Resources/QA/Data/CustomerCase.json"));
          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function partnerConsentModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "PartnerConsent",
            require("../../Test_Resources/QA/Data/PartnerConsent.json"));
          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function userModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "UserModel", require("../../Test_Resources/QA/Data/UserModel.json"));
          loader.load(function cb1(err, rows) {
            if (err) {
              throw err;
            }
            users = rows;
            callback();
          });
        },
        function roleModel(_ignoredParam, callback) {
          var loader = new DataLoader(app, "Role", require("../../Test_Resources/QA/Data/Role.json"));
          loader.load(function cb1(err, rows) {
            if (err) {
              throw err;
            }
            roles = rows;
            callback();
          });
        },
        function roleMappingModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "RoleMapping",
            require("../../Test_Resources/QA/Data/RoleMapping.json"), {
              "roleId": R.map(function map(row) {
                return row.id;
              }, roles),
              "principalId": R.map(function map(row) {
                return row.id;
              }, users)
            });
          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function customerAccountUserMappingModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "CustomerAccountUserMapping",
            require("../../Test_Resources/QA/Data/CustomerAccountUserMapping.json"), {
              "userModelId": R.map(function map(row) {
                return row.id;
              }, users)
            });
          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function partnerAccountUserMappingModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "PartnerAccountUserMapping",
            require("../../Test_Resources/QA/Data/PartnerAccountUserMapping.json"), {
              "userModelId": R.map(function map(row) {
                return row.id;
              }, users)
            });
          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function contractorAccountUserMappingModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "ContractorAccountUserMapping",
            require("../../Test_Resources/QA/Data/ContractorAccountUserMapping.json"), {
              "userModelId": R.map(function map(row) {
                return row.id;
              }, users)
            });
          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function operationsAccountUserMappingModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "OperationsAccountUserMapping",
            require("../../Test_Resources/QA/Data/OperationsAccountUserMapping.json"), {
              "userModelId": R.map(function map(row) {
                return row.id;
              }, users)
            });
          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function vehicleComponentTypeModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "VehicleComponentType",
            require("../../Test_Resources/QA/Data/VehicleComponentType.json"));
          loader.load(function cb1(err, rows) {
            if (err) {
              throw err;
            }
            vehicleComponentTypes = rows;
            callback();
          });
        },
        function vehicleComponentModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "VehicleComponent",
            require("../../Test_Resources/QA/Data/VehicleComponent.json"), {
              "vehicleComponentTypeId": R.map(function map(row) {
                return row.id;
              }, vehicleComponentTypes)
            });

          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function vehicleComponentSetTypeModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "VehicleComponentSetType",
            require("../../Test_Resources/QA/Data/VehicleComponentSetType.json"));

          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function vehicleComponentSetModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "VehicleComponentSet",
            require("../../Test_Resources/QA/Data/VehicleComponentSet.json"));

          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function vehicleComponentSetItemModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "VehicleComponentSetItem",
            require("../../Test_Resources/QA/Data/VehicleComponentSetItem.json"));

          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        },
        function vehicleComponentConnectionModels(_ignoredParam, callback) {
          var loader = new DataLoader(app, "VehicleComponentConnection",
            require("../../Test_Resources/QA/Data/VehicleComponentConnection.json"));

          loader.load(function cb1(err) {
            if (err) {
              throw err;
            }
            callback();
          });
        }
      ]
    }, function done(err) {
      if (err) {
        debug('error: %s', err.message);
      }
      debug('04 data load - complete');
      cb();
    });
  }
};
