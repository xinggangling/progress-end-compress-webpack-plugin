var path = require('path');
var ProgressBar = require('progress');
var chalk = require('chalk');
var webpack = require('webpack');
var compressing = require('compressing');

var node_ssh = require('node-ssh')
var ssh = new node_ssh()

require('object.assign').shim();

module.exports = function ProgressEndCompressPlugin(options) {
  options = options || {};

  var stream = options.stream || process.stderr;
  var enabled = stream && stream.isTTY;

  if (!enabled) {
    return function () {};
  }

  var barLeft = chalk.bold('[');
  var barRight = chalk.bold(']');
  var preamble = chalk.cyan.bold('  build ') + barLeft;
  var barFormat = options.format || preamble + ':bar' + barRight + chalk.green.bold(' :percent');
  var summary = options.summary !== false;
  var summaryContent = options.summaryContent;
  var customSummary = options.customSummary;

  delete options.format;
  delete options.total;
  delete options.summary;
  delete options.summaryContent;
  delete options.customSummary;

  var barOptions = Object.assign({
    complete: '>',
    incomplete: ' ',
    width: 20,
    total: 100,
    clear: true
  }, options);

  var bar = new ProgressBar(barFormat, barOptions);

  var running = false;
  var startTime = 0;
  var lastPercent = 0;

  return new webpack.ProgressPlugin(function (percent, msg) {
    if (!running && lastPercent !== 0 && !customSummary) {
      stream.write('\n');
    }

    var newPercent = Math.ceil(percent * barOptions.width);

    if (lastPercent !== newPercent) {
      bar.update(percent, {
        msg: msg
      });
      lastPercent = newPercent;
    }

    if (!running) {
      running = true;
      startTime = new Date;
      lastPercent = 0;
    } else if (percent === 1) {
      var now = new Date;
      var buildTime = (now - startTime) / 1000 + 's';

      bar.terminate();

      if (summary) {
        setTimeout(function() {
          stream.write('\n')
          stream.write(chalk.green.bold('Build completed in ' + buildTime + '\n\n'));
          if (options.compressDir && options.compressDir.paths) {
            for (var i = 0; i < options.compressDir.paths.length; i++) {
              try {
                var sourceDir = options.compressDir.paths[i].sourceDir;
                var targetDir = options.compressDir.paths[i].targetDir;
                var name = options.compressDir.paths[i].name;
                var hash = options.compressDir.paths[i].hash || Date.now();
                var compressFile = name + '.' + hash + '.tgz';
                var rename = options.compressDir.paths[i].rename;
                var compressPromise = new Promise(function() {
                  var self = this;
                  compressing.tgz.compressDir(sourceDir, path.join(targetDir, compressFile))
                    .then(function() {
                      var config = options.sshConfig;
                      
                      if (process.argv.includes('--useSsh') && /^\w*.\d*.tgz/.test(compressFile)) {
                        ssh.connect({
                          host: config.host,
                          username: config.username,
                          port: config.port,
                          password: config.password
                        }).then(function() {
                          ssh.putFile(path.join(targetDir, compressFile), config.romotePath + compressFile).then(function(Contents) {
                            console.log(chalk.green.bold(compressFile + ' has been successfully uploaded to ' + config.host + ': ' + config.romotePath));
                          }, function(error) {
                            console.log(chalk.red.bold("Something's wrong --> "));
                            console.log(error)
                          }).then(function() {
                            if (config.replaceDirectly) {
                              ssh.execCommand('rm -rf ' + name, { cwd: config.romotePath }).then(function(result) {
                                if (result.stdout)
                                  console.log('STDOUT: ' + result.stdout)
                                if (result.stderr)
                                  console.log('STDERR: ' + result.stderr)
                              }).then(function() {
                                ssh.execCommand('tar zxvf ' + compressFile, { cwd: config.romotePath }).then(function(result) {
                                  if (result.stdout)
                                      console.log('STDOUT: ' + result.stdout)
                                  if (result.stderr)
                                    console.log('STDERR: ' + result.stderr)
                                })
                              }).then(function() {
                                if (rename) {
                                  ssh.execCommand('mv ' + compressFile + ' ' + rename, { cwd: config.romotePath }).then(function(result) {
                                    if (result.stdout)
                                      console.log('STDOUT: ' + result.stdout)
                                    if (result.stderr)
                                      console.log('STDERR: ' + result.stderr)
                                  })
                                }
                              })
                            }
                          })
                        })
                      }
                      console.log(chalk.green.bold('created: ' + compressFile + '\n'));
                    })
                    .catch(self.handleError);
                })
    
                compressPromise.then(function() {
                  console.log('compress success')
                })
                
              } catch(e) {
                // console.log('')
              }          
            }
          }
        }, 100)
      } else if (summaryContent) {
        stream.write(summaryContent + '(' + buildTime + ')\n\n');
      }

      if (customSummary) {
        customSummary(buildTime);
      }

      running = false;
    }
  });
};
