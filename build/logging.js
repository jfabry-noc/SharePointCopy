"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logTime = exports.LogLevels = void 0;
var path = require("path");
var LogLevels;
(function (LogLevels) {
    LogLevels["DEBUG"] = "DEBUG";
    LogLevels["INFO"] = "INFO";
    LogLevels["WARNING"] = "WARNING";
    LogLevels["ERROR"] = "ERROR";
})(LogLevels || (exports.LogLevels = LogLevels = {}));
function enumToInt(level) {
    if (!level) {
        return 3;
    }
    if (level === LogLevels.DEBUG) {
        return 0;
    }
    else if (level === LogLevels.INFO) {
        return 1;
    }
    else if (level === LogLevels.WARNING) {
        return 2;
    }
    else {
        return 3;
    }
}
function envToLevel() {
    var envLevel = process.env['LOGGING'];
    if (!envLevel) {
        envLevel = 'ERROR';
    }
    envLevel = envLevel.toUpperCase();
    if (envLevel in LogLevels) {
        if (envLevel === 'DEBUG') {
            return LogLevels.DEBUG;
        }
        else if (envLevel === 'INFO') {
            return LogLevels.INFO;
        }
        else if (envLevel === 'WARNING') {
            return LogLevels.WARNING;
        }
    }
    return LogLevels.ERROR;
}
function shouldLog(level) {
    var desiredLevel = enumToInt(envToLevel());
    var currentLevel = enumToInt(level);
    if (currentLevel >= desiredLevel) {
        return true;
    }
    return false;
}
function logTime(message, level) {
    if (!level) {
        level = LogLevels.INFO;
    }
    if (shouldLog(level)) {
        var timeStamp = new Date().toISOString();
        var separator = path.sep;
        var fileName = __filename.split(separator).slice(-1)[0];
        console.log("".concat(timeStamp, " -- ").concat(level, " -- ").concat(fileName, " -- ").concat(message));
    }
}
exports.logTime = logTime;
