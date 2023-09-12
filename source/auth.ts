// https://learn.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-console
import { MissingVariable } from "./errors";
import * as core from '@actions/core';
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

if(core.getInput('client_id')) {
    clientId = core.getInput('client_id');
} else {
    throwMissingVar('client_id');
}
if(core.getInput('aad_endpoint')) {
    aadEndpoint = core.getInput('aad_endpoint');
} else {
    throwMissingVar('aad_endpoint');
}
if(core.getInput('tenant_id')) {
    tenantId = core.getInput('tenant_id');
} else {
    throwMissingVar('tenant_id');
}
if(core.getInput('client_secret')) {
    clientSecret = core.getInput('client_secret');
} else {
    throwMissingVar('client_secret');
}
if(core.getInput('graph_endpoint')) {
    graphEndpoint = core.getInput('graph_endpoint');
} else {
    throwMissingVar('graph_endpoint');
}
if(core.getInput('spo_path')) {
    spoPath = core.getInput('spo_path');
} else {
    throwMissingVar('spo_path');
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
    uriDir: '' + graphEndpoint + spoPath,
    uriChildren: '' + graphEndpoint + spoPath + ':/children/',
    uriBase: '' + graphEndpoint + spoPath.split('/root:')[0],
}
const cca = new msal.ConfidentialClientApplication(msalConfig);

export async function getToken(tokenRequest: object) {
    return cca.acquireTokenByClientCredential(tokenRequest);
}
