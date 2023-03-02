/* tslint:disable */
/* eslint-disable */
/**
 * My Title
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface ScoutingRequest
 */
export interface ScoutingRequest {
    /**
     * 
     * @type {Array<string>}
     * @memberof ScoutingRequest
     */
    users?: Array<string> | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof ScoutingRequest
     */
    tiers?: Array<string> | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof ScoutingRequest
     */
    opponents?: Array<string> | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof ScoutingRequest
     */
    links?: Array<string> | null;
}

/**
 * Check if a given object implements the ScoutingRequest interface.
 */
export function instanceOfScoutingRequest(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function ScoutingRequestFromJSON(json: any): ScoutingRequest {
    return ScoutingRequestFromJSONTyped(json, false);
}

export function ScoutingRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ScoutingRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'users': !exists(json, 'users') ? undefined : json['users'],
        'tiers': !exists(json, 'tiers') ? undefined : json['tiers'],
        'opponents': !exists(json, 'opponents') ? undefined : json['opponents'],
        'links': !exists(json, 'links') ? undefined : json['links'],
    };
}

export function ScoutingRequestToJSON(value?: ScoutingRequest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'users': value.users,
        'tiers': value.tiers,
        'opponents': value.opponents,
        'links': value.links,
    };
}

