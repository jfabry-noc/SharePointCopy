"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var errors_1 = require("./errors");
var logging_1 = require("./logging");
var zipController_1 = require("./zipController");
function validateEnv() {
    var requiredVars = [
        'TENANT_ID',
        'CLIENT_ID',
        'CLIENT_SECRET',
        'AAD_ENDPOINT',
        'GRAPH_ENDPOINT',
    ];
    (0, logging_1.logTime)("Verifying the following environment variables: ".concat(requiredVars.join(",")), logging_1.LogLevels.INFO);
    requiredVars.forEach(function (element) {
        if (!process.env[element]) {
            throw new errors_1.MissingVariable("Missing ".concat(element, " as an environment variable!"));
        }
    });
}
function padTwoDigits(num) {
    return num.toString().padStart(2, '0');
}
function getSolutionName() {
    var nameBase = process.env.BASE_NAME;
    if (!nameBase) {
        nameBase = "sharepoint_action";
    }
    return nameBase;
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
(0, logging_1.logTime)('Beginning a new run.', logging_1.LogLevels.INFO);
var directoryPath = '/private/tmp/testing';
var zipPath = "/private/tmp/".concat(getSolutionName(), "_").concat(formatDate(new Date()), ".zip");
validateEnv();
var zippy = new zipController_1.ZipController(directoryPath, zipPath);
zippy.createZip();
