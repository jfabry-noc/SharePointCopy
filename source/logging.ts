import * as path from 'path';

export enum LogLevels {
    'DEBUG' = 'DEBUG',
    'INFO' = 'INFO',
    'WARNING' = 'WARNING',
    'ERROR' = 'ERROR',
}

function enumToInt(level?: LogLevels): number {
    if(!level) {
        return 3;
    }

    if(level === LogLevels.DEBUG) {
        return 0;
    } else if(level === LogLevels.INFO) {
        return 1;
    } else if(level === LogLevels.WARNING) {
        return 2;
    } else {
        return 3;
    }
}

function envToLevel(): LogLevels {
    let envLevel = process.env['LOGGING'];
    if(!envLevel) {
        envLevel = 'ERROR';
    }
    envLevel = envLevel.toUpperCase();
    if(envLevel in LogLevels) {
        if(envLevel === 'DEBUG') {
            return LogLevels.DEBUG;
        } else if(envLevel === 'INFO') {
            return LogLevels.INFO;
        } else if(envLevel === 'WARNING') {
            return LogLevels.WARNING;
        }
    }
    return LogLevels.ERROR;
}

function shouldLog(level: LogLevels): boolean {
    const desiredLevel: number = enumToInt(envToLevel());
    const currentLevel: number = enumToInt(level);

    if(currentLevel >= desiredLevel) {
        return true;
    }
    return false;
}

export function logTime(message: string, level?: LogLevels) {
    if(!level) {
        level = LogLevels.INFO
    }

    if(shouldLog(level)) {
        const timeStamp = new Date().toISOString();
        const separator = path.sep;
        const fileName = __filename.split(separator).slice(-1)[0];
        console.log(`${timeStamp} -- ${level} -- ${fileName} -- ${message}`);
    }
}
