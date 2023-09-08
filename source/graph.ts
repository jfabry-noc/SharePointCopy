import axios from 'axios';
import { logTime, LogLevels } from './logging';

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
    logTime(`Using Body: ${body}`, LogLevels.DEBUG);

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
        logTime(
            `Failed to POST to endpoint with error: ${error}`, LogLevels.ERROR
        );
    }
}
