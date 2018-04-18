var path = require("path");
var cpdir = require("ncp").ncp;
var rmdir = require("rimraf");

var oldStaticPath = path.join(__dirname, "../static");
var buildPath = path.join(__dirname, "build/");
var parentPath = path.join(__dirname, "../");

var copyDirectory = (src, dest) => {
  return new Promise((resolve, reject) => {
    cpdir(src, dest, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

var removeDirectory = src => {
  return new Promise((resolve, reject) => {
    rmdir(src, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

removeDirectory(oldStaticPath)
  .then(() => copyDirectory(buildPath, parentPath))
  .then(() => removeDirectory(buildPath));
