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
 * @interface ApiScoutingRequest
 */
export interface ApiScoutingRequest {
    /**
     * 
     * @type {Array<string>}
     * @memberof ApiScoutingRequest
     */
    users?: Array<string> | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof ApiScoutingRequest
     */
    tiers?: Array<string> | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof ApiScoutingRequest
     */
    opponents?: Array<string> | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof ApiScoutingRequest
     */
    links?: Array<string> | null;
    /**
     * 
     * @type {boolean}
     * @memberof ApiScoutingRequest
     */
    provideOutput?: boolean | null;
}

/**
 * Check if a given object implements the ApiScoutingRequest interface.
 */
export function instanceOfApiScoutingRequest(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function ApiScoutingRequestFromJSON(json: any): ApiScoutingRequest {
    return ApiScoutingRequestFromJSONTyped(json, false);
}

export function ApiScoutingRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ApiScoutingRequest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'users': !exists(json, 'users') ? undefined : json['users'],
        'tiers': !exists(json, 'tiers') ? undefined : json['tiers'],
        'opponents': !exists(json, 'opponents') ? undefined : json['opponents'],
        'links': !exists(json, 'links') ? undefined : json['links'],
        'provideOutput': !exists(json, 'provideOutput') ? undefined : json['provideOutput'],
    };
}

export function ApiScoutingRequestToJSON(value?: ApiScoutingRequest | null): any {
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
        'provideOutput': value.provideOutput,
    };
}
