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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var errors_1 = require("./errors");
var graph_1 = require("./graph");
var logging_1 = require("./logging");
var zipController_1 = require("./zipController");
var auth = __importStar(require("./auth"));
var defaultArchiveCount = 4;
/**
 * Validates the required environment variables are found.
 */
function validateEnv() {
    var requiredVars = [
        'TENANT_ID',
        'CLIENT_ID',
        'CLIENT_SECRET',
        'AAD_ENDPOINT',
        'GRAPH_ENDPOINT',
        'SPO_PATH',
    ];
    (0, logging_1.logTime)("Verifying the following environment variables: ".concat(requiredVars.join(",")), logging_1.LogLevels.INFO);
    requiredVars.forEach(function (element) {
        if (!process.env[element]) {
            throw new errors_1.MissingVariable("Missing ".concat(element, " as an environment variable!"));
        }
    });
}
/**
 * Pads a given number to 2 digits with 0's.
 * @param {number} num
 * @returns {string}
 */
function padTwoDigits(num) {
    return num.toString().padStart(2, '0');
}
/**
 * Gets the name of the solution being backed up from the environment variable
 * or uses a default one if no corresponding environment variable is found.
 * @returns {string}
 */
function getSolutionName() {
    var nameBase = process.env.BASE_NAME;
    if (!nameBase) {
        nameBase = "sharepoint_action";
    }
    return nameBase;
}
/**
 * Formats a Date object into a filename format.
 * @param {Date} date
 * @returns {string}
 */
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
/**
 * Ensures an expected value was receive from the API response.
 * @param {string} valueName
 * @param {string?} value
 */
function validateRespValue(valueName, value) {
    if (!value) {
        throw new errors_1.MissingResponseValue("No ".concat(valueName, " was received from the API response."));
    }
}
/**
 * Determines the number of archives to keep. Defaults to 4.
 * @returns {number}
 */
function getNumArchives() {
    var archiveEnv = process.env.ARCHIVE_COUNT;
    if (!archiveEnv) {
        (0, logging_1.logTime)("No archive count set. Using the default archive count of: ".concat(defaultArchiveCount), logging_1.LogLevels.INFO);
        return defaultArchiveCount;
    }
    var archiveNum = parseInt(archiveEnv, 10);
    if (!archiveNum || isNaN(archiveNum)) {
        (0, logging_1.logTime)("Invalid archive count specified: ".concat(archiveEnv, ". Using the default archive count of: ").concat(defaultArchiveCount), logging_1.LogLevels.WARNING);
        return defaultArchiveCount;
    }
    (0, logging_1.logTime)("Using correctly specified archive count: ".concat(archiveNum), logging_1.LogLevels.INFO);
    return archiveNum;
}
/**
 * Prunes the files in SharePoint so only the maximum given number exist.
 * @param {number} maxFiles
 * @param {SpoItem[]} currentFiles
 * @param {string} accessToken
 */
function pruneFiles(maxFiles, currentFiles, accessToken) {
    currentFiles.sort(function (a, b) { return Date.parse(a.createdDateTime) - Date.parse(b.createdDateTime); });
    while (currentFiles.length > maxFiles) {
        (0, logging_1.logTime)("Deleting file with ID ".concat(currentFiles[0].id, " and timestamp: ").concat(currentFiles[0].createdDateTime), logging_1.LogLevels.INFO);
        var deleteUri = auth.apiConfig.uriBase + '/items/' + currentFiles[0].id;
        (0, graph_1.deleteSpoContent)(deleteUri, accessToken);
        currentFiles.shift();
        (0, logging_1.logTime)("Current number of files in the directory: ".concat(currentFiles.length), logging_1.LogLevels.DEBUG);
    }
}
/**
 * Main entrypoint into the solution.
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var directoryPath, zipPath, zipArr, zipName, archiveNum, zippy, authResponse, dirIdResp, dirId, uploadReqUri, uploadPayload, uploadUriResp, uploadUri, fileBuffer, childUri, fileContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, logging_1.logTime)('Beginning a new run.', logging_1.LogLevels.INFO);
                    directoryPath = '/private/tmp/testing';
                    zipPath = "/private/tmp/".concat(getSolutionName(), "_").concat(formatDate(new Date()), ".zip");
                    zipArr = zipPath.split('/');
                    zipName = zipArr[zipArr.length - 1];
                    archiveNum = getNumArchives();
                    validateEnv();
                    zippy = new zipController_1.ZipController(directoryPath, zipPath);
                    zippy.createZip();
                    (0, logging_1.logTime)('Attempting to get an access token from AAD.', logging_1.LogLevels.INFO);
                    return [4 /*yield*/, auth.getToken(auth.tokenRequest)];
                case 1:
                    authResponse = _a.sent();
                    if (!authResponse) {
                        (0, logging_1.logTime)('Failed to receive any auth response.', logging_1.LogLevels.ERROR);
                        return [2 /*return*/];
                    }
                    (0, logging_1.logTime)("Received authentication token: ".concat(authResponse.accessToken), logging_1.LogLevels.INFO);
                    validateRespValue('access token', authResponse.accessToken);
                    (0, logging_1.logTime)("Trying to get the directory ID from: ".concat(auth.apiConfig.uriDir), logging_1.LogLevels.INFO);
                    return [4 /*yield*/, (0, graph_1.getSpoContent)(auth.apiConfig.uriDir, authResponse.accessToken)];
                case 2:
                    dirIdResp = _a.sent();
                    dirId = dirIdResp.id;
                    validateRespValue('directory id', dirId);
                    (0, logging_1.logTime)("Found directory ID value: ".concat(dirId), logging_1.LogLevels.DEBUG);
                    uploadReqUri = auth.apiConfig.uriBase +
                        '/items/' +
                        dirId +
                        ':/' +
                        zipName +
                        ':/createUploadSession';
                    (0, logging_1.logTime)("Requesting an upload session from: ".concat(uploadReqUri), logging_1.LogLevels.DEBUG);
                    uploadPayload = {
                        '@microsoft.graph.conflictBehavior': 'replace',
                        description: 'GitHub repository archive.',
                        fileSystemInfo: { 'odata.type': 'microsoft.graph.fileSystemInfo' },
                        name: zipName,
                    };
                    return [4 /*yield*/, (0, graph_1.postSpoContent)(uploadReqUri, authResponse.accessToken, uploadPayload)];
                case 3:
                    uploadUriResp = _a.sent();
                    uploadUri = uploadUriResp.uploadUrl;
                    if (!uploadUri) {
                        throw new errors_1.MissingResponseValue('Failed to retrieve response for upload URI.');
                    }
                    fileBuffer = zippy.getBuffer(zipPath);
                    if (!fileBuffer) {
                        throw new errors_1.BufferFailure('Failed to successfully open a file buffer.');
                    }
                    return [4 /*yield*/, (0, graph_1.uploadSpoContent)(uploadUri, authResponse.accessToken, fileBuffer)];
                case 4:
                    _a.sent();
                    (0, logging_1.logTime)("Getting content in directory from: ".concat(auth.apiConfig.uriChildren), logging_1.LogLevels.INFO);
                    childUri = auth.apiConfig.uriChildren + '?$select=id,name,createdDateTime,lastModifiedDateTime';
                    return [4 /*yield*/, (0, graph_1.getSpoContent)(childUri, authResponse.accessToken)];
                case 5:
                    fileContent = _a.sent();
                    if (fileContent.value.length > archiveNum) {
                        (0, logging_1.logTime)("Found ".concat(fileContent.value.length, " archives. Removing ").concat(fileContent.value.length - archiveNum, " copies."), logging_1.LogLevels.INFO);
                        pruneFiles(archiveNum, fileContent.value, authResponse.accessToken);
                    }
                    else {
                        (0, logging_1.logTime)("Found only ".concat(fileContent.value.length, " archives. No need for removal."), logging_1.LogLevels.INFO);
                    }
                    zippy.removeArchive(zipPath);
                    return [2 /*return*/];
            }
        });
    });
}
main();
