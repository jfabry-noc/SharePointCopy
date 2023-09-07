"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logTime = exports.LogLevels = void 0;
var path = __importStar(require("path"));
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
