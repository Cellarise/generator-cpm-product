'use strict';
var yosay = require('yosay');

var actions = exports;

// All actions defined in this file should be called with `this` pointing
// to a generator instance

actions.greet = function greet() {
  this.log(yosay("Let's create a Cellarise product!"));
};

actions.scaffold = {
  "composeModule": function composeModule() {
    if (!this.options['skip-module']) {
      this.composeWith("cpm-module", {
        "options": {
          "skip-welcome-message": true,
          "packageJSON": this.src.readJSON('./package.json')
        }
      }, {
        "local": require.resolve("generator-cpm-module"),
        "link": "strong"
      });
    }
  }, /*
   "composeLoopback": function composeLoopback() {
   this.composeWith("loopback", {
   "options": {
   "skip-welcome-message": true
   }
   }, {
   "local": require.resolve("generator-loopback")
   });
   },*/
  "writeClient": function writeClient() {
    this.directory('./client', './client');
  },
  "writeServer": function writeServer() {
    this.directory('./server', './server');
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
