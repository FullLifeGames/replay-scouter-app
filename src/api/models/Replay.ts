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
import type { PlayerInfo } from './PlayerInfo';
import {
    PlayerInfoFromJSON,
    PlayerInfoFromJSONTyped,
    PlayerInfoToJSON,
} from './PlayerInfo';

/**
 * 
 * @export
 * @interface Replay
 */
export interface Replay {
    /**
     * 
     * @type {string}
     * @memberof Replay
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof Replay
     */
    p1?: string;
    /**
     * 
     * @type {string}
     * @memberof Replay
     */
    p2?: string;
    /**
     * 
     * @type {string}
     * @memberof Replay
     */
    format?: string;
    /**
     * 
     * @type {string}
     * @memberof Replay
     */
    log?: string;
    /**
     * 
     * @type {number}
     * @memberof Replay
     */
    uploadTime?: number;
    /**
     * 
     * @type {number}
     * @memberof Replay
     */
    views?: number;
    /**
     * 
     * @type {string}
     * @memberof Replay
     */
    p1Id?: string;
    /**
     * 
     * @type {string}
     * @memberof Replay
     */
    p2Id?: string;
    /**
     * 
     * @type {string}
     * @memberof Replay
     */
    formatId?: string;
    /**
     * 
     * @type {number}
     * @memberof Replay
     */
    rating?: number;
    /**
     * 
     * @type {number}
     * @memberof Replay
     */
    _private?: number;
    /**
     * 
     * @type {string}
     * @memberof Replay
     */
    password?: string;
    /**
     * 
     * @type {string}
     * @memberof Replay
     */
    winner?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof Replay
     */
    winForTeam?: boolean;
    /**
     * 
     * @type {PlayerInfo}
     * @memberof Replay
     */
    playerInfo?: PlayerInfo;
    /**
     * 
     * @type {string}
     * @memberof Replay
     */
    link?: string;
    /**
     * 
     * @type {string[]}
     * @memberof Replay
     */
    players?: string[];
}

/**
 * Check if a given object implements the Replay interface.
 */
export function instanceOfReplay(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function ReplayFromJSON(json: any): Replay {
    return ReplayFromJSONTyped(json, false);
}

export function ReplayFromJSONTyped(json: any, ignoreDiscriminator: boolean): Replay {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'p1': !exists(json, 'p1') ? undefined : json['p1'],
        'p2': !exists(json, 'p2') ? undefined : json['p2'],
        'format': !exists(json, 'format') ? undefined : json['format'],
        'log': !exists(json, 'log') ? undefined : json['log'],
        'uploadTime': !exists(json, 'uploadTime') ? undefined : json['uploadTime'],
        'views': !exists(json, 'views') ? undefined : json['views'],
        'p1Id': !exists(json, 'p1Id') ? undefined : json['p1Id'],
        'p2Id': !exists(json, 'p2Id') ? undefined : json['p2Id'],
        'formatId': !exists(json, 'formatId') ? undefined : json['formatId'],
        'rating': !exists(json, 'rating') ? undefined : json['rating'],
        '_private': !exists(json, 'private') ? undefined : json['private'],
        'password': !exists(json, 'password') ? undefined : json['password'],
        'winner': !exists(json, 'winner') ? undefined : json['winner'],
        'winForTeam': !exists(json, 'winForTeam') ? undefined : json['winForTeam'],
        'playerInfo': !exists(json, 'playerInfo') ? undefined : PlayerInfoFromJSON(json['playerInfo']),
        'link': !exists(json, 'link') ? undefined : json['link'],
    };
}

export function ReplayToJSON(value?: Replay | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'p1': value.p1,
        'p2': value.p2,
        'format': value.format,
        'log': value.log,
        'uploadTime': value.uploadTime,
        'views': value.views,
        'p1Id': value.p1Id,
        'p2Id': value.p2Id,
        'formatId': value.formatId,
        'rating': value.rating,
        'private': value._private,
        'password': value.password,
        'winner': value.winner,
        'winForTeam': value.winForTeam,
        'playerInfo': PlayerInfoToJSON(value.playerInfo),
        'link': value.link,
    };
}

