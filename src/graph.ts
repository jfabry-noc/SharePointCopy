import axios, {AxiosError} from 'axios';
import { logTime, LogLevels } from './logging';

/**
 * Gets content from a SharePoint Online directory.
 * @param {string} endpoint
 * @param {string} accessToken
 * @returns {object}
 */
export async function getSpoContent(endpoint: string, accessToken: string): Promise<any> {
    logTime(`Making a GET to: ${endpoint}`, LogLevels.DEBUG);

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
    logTime(`Making a POST to: ${endpoint}`, LogLevels.DEBUG);

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    };

    const response = await axios.post(endpoint, body, options);
    return response.data;
}

export async function uploadSpoContent(endpoint: string, accessToken: string, data: Buffer) {
    logTime(`Making POST to: ${endpoint}`, LogLevels.DEBUG);
    logTime(`Content length is: ${data.length}`, LogLevels.DEBUG);
    logTime(`Using content range: bytes 0-${data.length - 1}/${data.length}`, LogLevels.DEBUG);

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

    await axios.put(endpoint, data, options);
}

export async function deleteSpoContent(endpoint: string, accessToken: string) {
    logTime(`Making DELETE to: ${endpoint}`, LogLevels.DEBUG);
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    };

    // Catch this one to attempt to delete other files if needed.
    try{
        await axios.delete(endpoint, options);
    } catch (error) {
        if(error instanceof AxiosError) {
            logTime(`Received error: ${error.code} - ${error.message}`, LogLevels.ERROR);
        } else {
            logTime(`Received error: ${error}`, LogLevels.ERROR);
        }
    }
}
