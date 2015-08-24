'use strict';
var yosay = require('yosay');
var path = require('path');
var R = require('ramda');

var actions = exports;

// All actions defined in this file should be called with `this` pointing
// to a generator instance

actions.greet = function greet() {
  this.log(yosay("Let's create a Cellarise product!"));
};

actions.scaffold = {
  "writeRootFiles": function writeRootFiles() {
    this.directory('./', './');
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
    this.fs.write(destPkgPath, JSON.stringify(R.merge(updatePkg, pkg), null, 2));
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
