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


import * as runtime from '../runtime';
import type {
  ApiScoutingRequest,
  ApiScoutingResult,
} from '../models';
import {
    ApiScoutingRequestFromJSON,
    ApiScoutingRequestToJSON,
    ApiScoutingResultFromJSON,
    ApiScoutingResultToJSON,
} from '../models';

export interface ScoutGetRequest {
    provideOutput?: boolean | null;
    users?: Array<string> | null;
    tiers?: Array<string> | null;
    opponents?: Array<string> | null;
    links?: Array<string> | null;
    maximumDate?: Date | null;
    minimumDate?: Date | null;
    grouped?: boolean;
}

export interface ScoutPostRequest {
    apiScoutingRequest: ApiScoutingRequest;
}

/**
 * 
 */
export class ScoutApi extends runtime.BaseAPI {

    /**
     */
    async scoutGetRaw(requestParameters: ScoutGetRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ApiScoutingResult>> {
        const queryParameters: any = {};

        if (requestParameters.provideOutput !== undefined) {
            queryParameters['ProvideOutput'] = requestParameters.provideOutput;
        }

        if (requestParameters.users) {
            queryParameters['Users'] = requestParameters.users;
        }

        if (requestParameters.tiers) {
            queryParameters['Tiers'] = requestParameters.tiers;
        }

        if (requestParameters.opponents) {
            queryParameters['Opponents'] = requestParameters.opponents;
        }

        if (requestParameters.links) {
            queryParameters['Links'] = requestParameters.links;
        }

        if (requestParameters.maximumDate !== undefined) {
            queryParameters['MaximumDate'] = (requestParameters.maximumDate as any).toISOString();
        }

        if (requestParameters.minimumDate !== undefined) {
            queryParameters['MinimumDate'] = (requestParameters.minimumDate as any).toISOString();
        }

        if (requestParameters.grouped !== undefined) {
            queryParameters['Grouped'] = requestParameters.grouped;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/Scout`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ApiScoutingResultFromJSON(jsonValue));
    }

    /**
     */
    async scoutGet(requestParameters: ScoutGetRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ApiScoutingResult> {
        const response = await this.scoutGetRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async scoutPostRaw(requestParameters: ScoutPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<ApiScoutingResult>> {
        if (requestParameters.apiScoutingRequest === null || requestParameters.apiScoutingRequest === undefined) {
            throw new runtime.RequiredError('apiScoutingRequest','Required parameter requestParameters.apiScoutingRequest was null or undefined when calling scoutPost.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/Scout`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ApiScoutingRequestToJSON(requestParameters.apiScoutingRequest),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ApiScoutingResultFromJSON(jsonValue));
    }

    /**
     */
    async scoutPost(requestParameters: ScoutPostRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<ApiScoutingResult> {
        const response = await this.scoutPostRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
