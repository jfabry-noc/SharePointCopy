"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipController = void 0;
var fs = require("fs");
var errors_1 = require("./errors");
var logging_1 = require("./logging");
var zipper = require('zip-local');
function verifyPath(filePath) {
    try {
        return fs.existsSync(filePath) && fs.statSync(filePath).isDirectory();
    }
    catch (error) {
        return false;
    }
}
function padTwoDigits(num) {
    return num.toString().padStart(2, '0');
}
function formatDate(date) {
    return ([
        date.getFullYear(),
        padTwoDigits(date.getMonth() + 1),
        padTwoDigits(date.getDate()),
    ].join('_') +
        '-' +
        [
            padTwoDigits(date.getHours()),
            padTwoDigits(date.getMinutes()),
            padTwoDigits(date.getSeconds())
        ].join('_'));
}
var ZipController = /** @class */ (function () {
    function ZipController(filePath, zipPath) {
        this.zipPath = "/tmp/backup_".concat(formatDate(new Date()), ".zip");
        if (!verifyPath(filePath)) {
            throw new errors_1.InvalidDirPath("No directory found at: ".concat(filePath));
        }
        this.mainPath = filePath;
        if (zipPath) {
            this.zipPath = zipPath;
        }
    }
    ZipController.prototype.removeArchive = function (filePath) {
        if (!filePath) {
            filePath = this.zipPath;
        }
        (0, logging_1.logTime)("Checking if file '".concat(filePath, "' exists to be deleted."));
        if (fs.existsSync(filePath)) {
            (0, logging_1.logTime)("File '".concat(filePath, "' found."));
            try {
                fs.unlinkSync(filePath);
                (0, logging_1.logTime)("File ".concat(filePath, " removed successfully."));
            }
            catch (error) {
                (0, logging_1.logTime)("Failed to remove ".concat(filePath, " with error: ").concat(error), logging_1.LogLevels.ERROR);
            }
        }
    };
    ZipController.prototype.createZip = function (dirPath, outputPath) {
        if (!dirPath) {
            (0, logging_1.logTime)("Setting path to back up to default: ".concat(this.mainPath), logging_1.LogLevels.DEBUG);
            dirPath = this.mainPath;
        }
        if (!outputPath) {
            (0, logging_1.logTime)("Setting path for zip file to default: ".concat(this.zipPath), logging_1.LogLevels.DEBUG);
            outputPath = this.zipPath;
        }
        (0, logging_1.logTime)("Creating zip file of '".concat(dirPath, "' written to '").concat(outputPath, "'"), logging_1.LogLevels.INFO);
        zipper.sync.zip(dirPath).compress().save(outputPath);
    };
    return ZipController;
}());
exports.ZipController = ZipController;
