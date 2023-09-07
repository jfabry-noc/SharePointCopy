import * as fs from 'fs';

import { InvalidDirPath } from './errors';
import { logTime, LogLevels } from './logging';

var zipper = require('zip-local');

function verifyPath(filePath: string): boolean {
    try {
        return fs.existsSync(filePath) && fs.statSync(filePath).isDirectory();
    } catch (error) {
        return false;
    }
}

function padTwoDigits(num: number) {
    return num.toString().padStart(2, '0');
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


export class ZipController {
    mainPath: string;
    zipPath: string = `/tmp/backup_${formatDate(new Date())}.zip`;

    constructor(filePath: string, zipPath?: string) {
        if(!verifyPath(filePath)) {
            throw new InvalidDirPath(`No directory found at: ${filePath}`);
        }
        this.mainPath = filePath;
        if(zipPath) {
            this.zipPath = zipPath;
        }
    }

    removeArchive(filePath?: string) {
        if(!filePath) {
            filePath = this.zipPath;
        }
        logTime(`Checking if file '${filePath}' exists to be deleted.`);
        if(fs.existsSync(filePath)) {
            logTime(`File '${filePath}' found.`);
            try {
                fs.unlinkSync(filePath);
                logTime(`File ${filePath} removed successfully.`);
            } catch (error) {
                logTime(
                    `Failed to remove ${filePath} with error: ${error}`,
                    LogLevels.ERROR
                );
            }
        }
    }

    createZip(dirPath?: string, outputPath?: string) {
        if(!dirPath) {
            logTime(
                `Setting path to back up to default: ${this.mainPath}`,
                LogLevels.DEBUG
            );
            dirPath = this.mainPath;
        }
        if(!outputPath) {
            logTime(
                `Setting path for zip file to default: ${this.zipPath}`,
                LogLevels.DEBUG
            );
            outputPath = this.zipPath;
        }
        logTime(
            `Creating zip file of '${dirPath}' written to '${outputPath}'`,
            LogLevels.INFO
        );
        zipper.sync.zip(dirPath).compress().save(outputPath);
    }
}
