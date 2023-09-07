import axios from 'axios';
import { logTime, LogLevels } from './logging';

/**
 * Gets content from a SharePoint Online directory.
 * @param {string} endpoint
 * @param {string} accessToken
 * @returns {object}
 */
export async function getSpoContent(endpoint: string, accessToken: string): Promise<any> {
    logTime(
        `Accessing '${endpoint}'`, LogLevels.INFO
    );
    logTime(
        `Using access token: ${accessToken}.`,LogLevels.DEBUG
    );
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
