import * as core from '@actions/core';

import { BufferFailure, MissingResponseValue, MissingVariable } from './errors';
import { deleteSpoContent, getSpoContent, postSpoContent, uploadSpoContent } from './graph';
import { SpoItem } from './interfaces';
import { logTime, LogLevels } from './logging';
import { ZipController } from './zipController';

import * as auth from './auth';

const defaultArchiveCount = 4;

/**
 * Validates the required environment variables are found.
 */
function validateEnv() {
    const requiredVars: string[] = [
        'tenant_id',
        'client_id',
        'client_secret',
        'aad_endpoint',
        'graph_endpoint',
        'spo_path',
        'base_name',
        'archive_count',
        'directory_path',
        'logging',
    ]

    logTime(
        `Verifying the following environment variables: ${requiredVars.join(",")}`,
        LogLevels.INFO
    );

    requiredVars.forEach((element) => {
        if(!core.getInput(element)) {
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
    let nameBase: string|undefined = core.getInput('base_name');
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
 * Determines the number of archives to keep. Defaults to 4.
 * @returns {number}
 */
function getNumArchives(): number {
    const archiveEnv = core.getInput('archive_count');
    if(!archiveEnv) {
        logTime(
            `No archive count set. Using the default archive count of: ${defaultArchiveCount}`,
            LogLevels.INFO
        );
        return defaultArchiveCount;
    }
    const archiveNum = parseInt(archiveEnv, 10);
    if(!archiveNum || isNaN(archiveNum)) {
        logTime(
            `Invalid archive count specified: ${archiveEnv}. Using the default archive count of: ${defaultArchiveCount}`,
            LogLevels.WARNING
        );
        return defaultArchiveCount;
    }

    if(archiveNum < 1) {
        logTime(
            `Archive number must be at least 1, not ${archiveNum}. Using default value of: ${defaultArchiveCount}`,
            LogLevels.WARNING
        );
    }
    logTime(`Using correctly specified archive count: ${archiveNum}`, LogLevels.INFO);
    return archiveNum;
}

/**
 * Prunes the files in SharePoint so only the maximum given number exist.
 * @param {number} maxFiles
 * @param {SpoItem[]} currentFiles
 * @param {string} accessToken
 */
function pruneFiles(maxFiles: number, currentFiles: SpoItem[], accessToken: string) {
    currentFiles.sort((a, b) => Date.parse(a.createdDateTime) - Date.parse(b.createdDateTime));

    while(currentFiles.length > maxFiles) {
        logTime(
            `Deleting file with ID ${currentFiles[0].id} and timestamp: ${currentFiles[0].createdDateTime}`,
            LogLevels.INFO
        );
        const deleteUri = auth.apiConfig.uriBase + '/items/' + currentFiles[0].id;
        deleteSpoContent(deleteUri, accessToken);
        currentFiles.shift();
        logTime(`Current number of files in the directory: ${currentFiles.length}`, LogLevels.DEBUG);
    }
}

/**
 * Main entrypoint into the solution.
 */
async function main() {
    logTime('Beginning a new run.', LogLevels.INFO);
    const directoryPath: string = core.getInput('directory_path');
    const zipPath: string = `/tmp/${getSolutionName()}_${formatDate(new Date())}.zip`;
    const zipArr: string[] = zipPath.split('/');
    const zipName: string = zipArr[zipArr.length -1];
    const archiveNum = getNumArchives();
    validateEnv();
    const zippy: ZipController = new ZipController(directoryPath, zipPath);
    zippy.verifyDirectory('/tmp');
    zippy.createZip();

    logTime('Attempting to get an access token from AAD.', LogLevels.INFO);
    const authResponse = await auth.getToken(auth.tokenRequest);
    if(!authResponse) {
        logTime(
            'Failed to receive any auth response.', LogLevels.ERROR
        );
        return;
    }
    logTime(`Successfully received authentication token.`, LogLevels.INFO);
    validateRespValue('access token', authResponse.accessToken);

    logTime(
        `Trying to get the directory ID from: ${auth.apiConfig.uriDir}`,
        LogLevels.INFO
    );
    const dirIdResp = await getSpoContent(auth.apiConfig.uriDir, authResponse.accessToken);
    const dirId: string|undefined = dirIdResp.id;
    validateRespValue('directory id', dirId);
    logTime(`Found directory ID value: ${dirId}`, LogLevels.DEBUG);


    const uploadReqUri: string = auth.apiConfig.uriBase +
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
    const childUri: string = auth.apiConfig.uriChildren + '?$select=id,name,createdDateTime,lastModifiedDateTime';
    const fileContent = await getSpoContent(childUri, authResponse.accessToken);
    if(fileContent.value.length > archiveNum) {
        logTime(
            `Found ${fileContent.value.length} archives. Removing ${fileContent.value.length - archiveNum} copy/copies.`,
            LogLevels.INFO
        );
        pruneFiles(archiveNum, fileContent.value, authResponse.accessToken);
    } else {
        logTime(`Found only ${fileContent.value.length} archives. No need for removal.`, LogLevels.INFO);
    }

    zippy.removeArchive(zipPath);
}

main();
