require('dotenv').config();

import { MissingVariable } from './errors';
import { logTime, LogLevels } from './logging';
import { ZipController } from './zipController';

function validateEnv() {
    const requiredVars: string[] = [
        'TENANT_ID',
        'CLIENT_ID',
        'CLIENT_SECRET',
        'AAD_ENDPOINT',
        'GRAPH_ENDPOINT',
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

function padTwoDigits(num: number) {
    return num.toString().padStart(2, '0');
}

function getSolutionName(): string {
    let nameBase: string|undefined = process.env.BASE_NAME;
    if(!nameBase) {
        nameBase = "sharepoint_action";
    }
    return nameBase;
}

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

logTime('Beginning a new run.', LogLevels.INFO);
const directoryPath: string = '/private/tmp/testing';
const zipPath: string = `/private/tmp/${getSolutionName()}_${formatDate(new Date())}.zip`;
validateEnv();
const zippy: ZipController = new ZipController(directoryPath, zipPath);
zippy.createZip();

