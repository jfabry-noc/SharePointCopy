import axios, {AxiosError} from 'axios';
import { logTime, LogLevels } from './logging';

import { BufferConversionFailure } from './errors';

/**
 * Gets content from a SharePoint Online directory.
 * @param {string} endpoint
 * @param {string} accessToken
 * @returns {object}
 */
export async function getSpoContent(endpoint: string, accessToken: string): Promise<any> {
    logTime(`Making a GET to: ${endpoint}`, LogLevels.INFO);

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.get(endpoint, options);
        return response.data;
    } catch (error) {
        logTime(
            `Failed to query endpoint with error: ${error}`, LogLevels.ERROR
        );
    }
}

export async function postSpoContent(endpoint: string, accessToken: string, body: object): Promise<any> {
    logTime(`Making a POST to: ${endpoint}`, LogLevels.INFO);

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    };

    try {
        const response = await axios.post(endpoint, body, options);
        return response.data;
    } catch (error) {
        logTime(`Failed to POST to endpoint with error: ${error}`, LogLevels.ERROR);
    }
}

export async function uploadSpoContent(endpoint: string, accessToken: string, data: Buffer) {
    logTime(`Making POST to: ${endpoint}`, LogLevels.INFO);
    logTime(`Content length is: ${data.length}`, LogLevels.INFO);
    logTime(`Using content range: bytes 0-${data.length - 1}/${data.length}`);

    const options = {
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json;odata=verbose',
            'Content-Length': data.length,
            'Content-Range': `bytes 0-${data.length - 1}/${data.length}`,
            Accept: 'application/json',
        }
    };

    try {
        await axios.put(endpoint, data, options);
    } catch (error) {
        if(error instanceof AxiosError) {
            logTime(
                `Failed to upload the file with error: ${error.code} - ${error.message}`,
                LogLevels.ERROR
            );
        } else {
            logTime(`Failed to upload the file with error: ${error}`, LogLevels.ERROR);
        }
    }
}
