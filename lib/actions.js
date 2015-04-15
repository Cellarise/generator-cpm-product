'use strict';
var yosay = require('yosay');
var path = require('path');
var _ = require('underscore');

var actions = exports;

// All actions defined in this file should be called with `this` pointing
// to a generator instance

actions.greet = function greet() {
  this.log(yosay("Let's create a Cellarise product!"));
};

actions.scaffold = {
  "writeClient": function writeClient() {
    this.directory('./client', './client');
  },
  "writeServer": function writeServer() {
    this.directory('./server', './server');
  },
  "writePackage": function writePackage() {
    var pkg = this.fs.readJSON('./package.json');
    var destPkgPath = path.join(this.destinationRoot(), 'package.json');
    var updatePkg;
    var updatePkgPath;
    if (this.options['package-path']) {
      updatePkgPath = this.options['package-path'];
    } else {
      updatePkgPath = destPkgPath;
    }
    updatePkg = this.fs.readJSON(updatePkgPath);
    pkg = _.extend(updatePkg, pkg);
    this.fs.write(destPkgPath, JSON.stringify(pkg, null, 2));
  }
};

actions.install = {
  "install": function install() {
    this.on('end', function onEnd() {
      if (!this.options['skip-install']) {
        this.installDependencies({
          "npm": true,
          "bower": false,
          "skipInstall": this.options['skip-install']
        });
      }
    });
  }
};
