/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BestandsbuchEntry } from '../models/BestandsbuchEntry';
import type { CreateBestandsbuchEntryRequest } from '../models/CreateBestandsbuchEntryRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class BestandsbuchService {

    /**
     * List bestandsbuch entries (optionally filtered by year/hiveId)
     * @param year 
     * @param hiveId 
     * @returns BestandsbuchEntry List of bestandsbuch entries
     * @throws ApiError
     */
    public static getApiV1Bestandsbuch(
year?: number,
hiveId?: string,
): CancelablePromise<Array<BestandsbuchEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/bestandsbuch',
            query: {
                'year': year,
                'hiveId': hiveId,
            },
        });
    }

    /**
     * Create a bestandsbuch entry
     * @param requestBody 
     * @returns BestandsbuchEntry Created bestandsbuch entry
     * @throws ApiError
     */
    public static postApiV1Bestandsbuch(
requestBody: CreateBestandsbuchEntryRequest,
): CancelablePromise<BestandsbuchEntry> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/bestandsbuch',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * List available years with bestandsbuch entries
     * @returns number Years in descending order
     * @throws ApiError
     */
    public static getApiV1BestandsbuchYears(): CancelablePromise<Array<number>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/bestandsbuch/years',
        });
    }

    /**
     * Update a bestandsbuch entry
     * @param id 
     * @param requestBody 
     * @returns BestandsbuchEntry Updated bestandsbuch entry
     * @throws ApiError
     */
    public static putApiV1Bestandsbuch(
id: string,
requestBody: CreateBestandsbuchEntryRequest,
): CancelablePromise<BestandsbuchEntry> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/bestandsbuch/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Resource not found`,
            },
        });
    }

    /**
     * Delete a bestandsbuch entry
     * @param id 
     * @returns any Deleted
     * @throws ApiError
     */
    public static deleteApiV1Bestandsbuch(
id: string,
): CancelablePromise<{
success?: boolean;
}> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/bestandsbuch/{id}',
            path: {
                'id': id,
            },
        });
    }

}