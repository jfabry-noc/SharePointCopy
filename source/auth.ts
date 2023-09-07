// https://learn.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-console
import { MissingVariable } from "./errors";
import * as msal from '@azure/msal-node';

let clientId: string = '';
let aadEndpoint: string = '';
let tenantId: string = '';
let clientSecret: string = '';
let graphEndpoint: string = '';
let spoPath: string = '';

function throwMissingVar(varName: string) {
    throw new MissingVariable(`Missing environment variable for: ${varName}`);
}

if(process.env.CLIENT_ID) {
    clientId = process.env.CLIENT_ID;
} else {
    throwMissingVar('CLIENT_ID');
}
if(process.env.AAD_ENDPOINT) {
    aadEndpoint = process.env.AAD_ENDPOINT;
} else {
    throwMissingVar('AAD_ENDPOINT');
}
if(process.env.TENANT_ID) {
    tenantId = process.env.TENANT_ID;
} else {
    throwMissingVar('TENANT_ID');
}
if(process.env.CLIENT_SECRET) {
    clientSecret = process.env.CLIENT_SECRET;
} else {
    throwMissingVar('CLIENT_SECRET');
}
if(process.env.GRAPH_ENDPOINT) {
    graphEndpoint = process.env.GRAPH_ENDPOINT;
} else {
    throwMissingVar('GRAPH_ENDPOINT');
}
if(process.env.SPO_PATH) {
    spoPath = process.env.SPO_PATH;
} else {
    throwMissingVar('SPO_PATH');
}

const msalConfig = {
    auth: {
        clientId: clientId,
        authority: aadEndpoint + '/' + tenantId,
        clientSecret: clientSecret,
    }
};
export const tokenRequest = {
    scopes: [graphEndpoint + '/.default'],
};
export const apiConfig = {
    uri: '' + graphEndpoint + spoPath,
}
const cca = new msal.ConfidentialClientApplication(msalConfig);

export async function getToken(tokenRequest: object) {
    return cca.acquireTokenByClientCredential(tokenRequest);
}

