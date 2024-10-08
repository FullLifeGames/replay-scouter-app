/* tslint:disable */
/* eslint-disable */
/**
 * Showdown Replay Scouter
 * This is the Showdown Replay Scouter API. <a href=\'https://github.com/FullLifeGames/Showdown-Replay-Scouter\'>This is the code.</a>
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { Team } from './Team';
import {
    TeamFromJSON,
    TeamFromJSONTyped,
    TeamToJSON,
} from './Team';

/**
 * 
 * @export
 * @interface ScoutingResult
 */
export interface ScoutingResult {
    /**
     * 
     * @type {Array<Team>}
     * @memberof ScoutingResult
     */
    teams?: Array<Team>;
}

/**
 * Check if a given object implements the ScoutingResult interface.
 */
export function instanceOfScoutingResult(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function ScoutingResultFromJSON(json: any): ScoutingResult {
    return ScoutingResultFromJSONTyped(json, false);
}

export function ScoutingResultFromJSONTyped(json: any, ignoreDiscriminator: boolean): ScoutingResult {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'teams': !exists(json, 'teams') ? undefined : ((json['teams'] as Array<any>).map(TeamFromJSON)),
    };
}

export function ScoutingResultToJSON(value?: ScoutingResult | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'teams': value.teams === undefined ? undefined : ((value.teams as Array<any>).map(TeamToJSON)),
    };
}

