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
exports.ZipController = void 0;
var fs = __importStar(require("fs"));
var errors_1 = require("./errors");
var logging_1 = require("./logging");
var zipper = require('zip-local');
/**
 * Verifies the given path exists and is a directory.
 * @param {string} filePath
 * @returns {boolean}
 */
function verifyPath(filePath) {
    try {
        return fs.existsSync(filePath) && fs.statSync(filePath).isDirectory();
    }
    catch (error) {
        return false;
    }
}
var ZipController = /** @class */ (function () {
    function ZipController(filePath, zipPath) {
        if (!verifyPath(filePath)) {
            throw new errors_1.InvalidDirPath("No directory found at: ".concat(filePath));
        }
        this.mainPath = filePath;
        this.zipPath = zipPath;
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
    ZipController.prototype.getBuffer = function (filePath) {
        (0, logging_1.logTime)("Reading file at: ".concat(filePath), logging_1.LogLevels.INFO);
        return fs.readFileSync(filePath);
    };
    return ZipController;
}());
exports.ZipController = ZipController;
