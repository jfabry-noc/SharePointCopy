require('dotenv').config();

import { MissingVariable } from './errors';
import { logTime, LogLevels } from './logging';
import { ZipController } from './zipController';

import * as auth from './auth';

/**
 * Validates the required environment variables are found.
 */
function validateEnv() {
    const requiredVars: string[] = [
        'TENANT_ID',
        'CLIENT_ID',
        'CLIENT_SECRET',
        'AAD_ENDPOINT',
        'GRAPH_ENDPOINT',
        'SPO_PATH',
    ]

    logTime(
        `Verifying the following environment variables: ${requiredVars.join(",")}`,
        LogLevels.INFO
    );

    requiredVars.forEach((element) => {
        if(!process.env[element]) {
            throw new MissingVariable(`Missing ${element} as an environment variable!`);
        }
    });
}

/**
 * Pads a given number to 2 digits with 0's.
 * @param {number} num
 * @returns {string}
 */
function padTwoDigits(num: number): string {
    return num.toString().padStart(2, '0');
}

/**
 * Gets the name of the solution being backed up from the environment variable
 * or uses a default one if no corresponding environment variable is found.
 * @returns {string}
 */
function getSolutionName(): string {
    let nameBase: string|undefined = process.env.BASE_NAME;
    if(!nameBase) {
        nameBase = "sharepoint_action";
    }
    return nameBase;
}

/**
 * Formats a Date object into a filename format.
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date: Date): string {
    return (
        [
            date.getFullYear(),
            padTwoDigits(date.getMonth() + 1),
            padTwoDigits(date.getDate()),
        ].join('_') +
        '-' +
        [
            padTwoDigits(date.getHours()),
            padTwoDigits(date.getMinutes()),
            padTwoDigits(date.getSeconds())
        ].join('_')
    );
}

/**
 * Main entrypoint into the solution.
 */
async function main() {
    logTime('Beginning a new run.', LogLevels.INFO);
    const directoryPath: string = '/private/tmp/testing';
    const zipPath: string = `/private/tmp/${getSolutionName()}_${formatDate(new Date())}.zip`;
    validateEnv();
    const zippy: ZipController = new ZipController(directoryPath, zipPath);
    zippy.createZip();

    const authResponse = await auth.getToken(auth.tokenRequest);
    if(!authResponse) {
        logTime(
            'Failed to receive any auth response.', LogLevels.ERROR
        );
        return;
    }
    logTime(
        `Received authentication token: ${authResponse.accessToken}`, LogLevels.DEBUG
    );

    zippy.removeArchive(zipPath);
}

main();
