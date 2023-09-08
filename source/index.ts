require('dotenv').config();

import { BufferFailure, MissingResponseValue, MissingVariable } from './errors';
import { getSpoContent, postSpoContent, uploadSpoContent } from './graph';
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
 * Ensures an expected value was receive from the API response.
 * @param {string} valueName
 * @param {string?} value
 */
function validateRespValue(valueName: string, value?: string) {
    if(!value) {
        throw new MissingResponseValue(
            `No ${valueName} was received from the API response.`
        );
    }
}

/**
 * Main entrypoint into the solution.
 */
async function main() {
    logTime('Beginning a new run.', LogLevels.INFO);
    const directoryPath: string = '/private/tmp/testing';
    const zipPath: string = `/private/tmp/${getSolutionName()}_${formatDate(new Date())}.zip`;
    const zipArr: string[] = zipPath.split('/');
    const zipName: string = zipArr[zipArr.length -1];
    validateEnv();
    const zippy: ZipController = new ZipController(directoryPath, zipPath);
    zippy.createZip();

    logTime('Attempting to get an access token from AAD.', LogLevels.INFO);
    const authResponse = await auth.getToken(auth.tokenRequest);
    if(!authResponse) {
        logTime(
            'Failed to receive any auth response.', LogLevels.ERROR
        );
        return;
    }
    logTime(
        `Received authentication token: ${authResponse.accessToken}`,
        LogLevels.INFO
    );
    validateRespValue('access token', authResponse.accessToken);

    logTime(
        `Trying to get the directory ID from: ${auth.apiConfig.uriDir}`,
        LogLevels.INFO
    );
    const dirIdResp = await getSpoContent(auth.apiConfig.uriDir, authResponse.accessToken);
    const dirId: string|undefined = dirIdResp.id;
    validateRespValue('directory id', dirId);
    logTime(`Found directory ID value: ${dirId}`, LogLevels.DEBUG);


    const uploadReqUri: string = auth.apiConfig.uriuploadBase +
                                '/items/' +
                                dirId +
                                ':/' +
                                zipName +
                                ':/createUploadSession';
    logTime(`Requesting an upload session from: ${uploadReqUri}`, LogLevels.DEBUG);
    const uploadPayload = {
        '@microsoft.graph.conflictBehavior': 'replace',
        description: 'GitHub repository archive.',
        fileSystemInfo: {'odata.type': 'microsoft.graph.fileSystemInfo'},
        name: zipName,
        //deferCommit: true,
    };
    const uploadUriResp = await postSpoContent(uploadReqUri, authResponse.accessToken, uploadPayload);
    const uploadUri: string|undefined = uploadUriResp.uploadUrl;
    if(!uploadUri) {
        throw new MissingResponseValue('Failed to retrieve response for upload URI.');
    }

    const fileBuffer = zippy.getBuffer(zipPath);
    if(!fileBuffer) {
        throw new BufferFailure('Failed to successfully open a file buffer.');
    }
    await uploadSpoContent(uploadUri, authResponse.accessToken, fileBuffer);

    logTime(
        `Getting content in directory from: ${auth.apiConfig.uriChildren}`,
        LogLevels.INFO
    );
    const content = await getSpoContent(auth.apiConfig.uriChildren, authResponse.accessToken);
    logTime(`Found ${content.value.length} items.`, LogLevels.DEBUG);
    for(const item of content.value) {
        logTime(`Response item: ${item.name}`, LogLevels.DEBUG);
    }

    zippy.removeArchive(zipPath);
}

main();
