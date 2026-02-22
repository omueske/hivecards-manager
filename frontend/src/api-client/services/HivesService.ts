/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateHiveRequest } from '../models/CreateHiveRequest';
import type { Hive } from '../models/Hive';
import type { PaginatedResponse } from '../models/PaginatedResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class HivesService {

    /**
     * List hives (optionally filtered by apiaryId / status)
     * @param hiveId 
     * @param apiaryId 
     * @param status 
     * @param page 
     * @param limit 
     * @returns PaginatedResponse Paginated list of hives
     * @throws ApiError
     */
    public static getApiV1Hives(
hiveId?: string,
apiaryId?: string,
status?: 'active' | 'inactive' | 'archived',
page: number = 1,
limit: number = 25,
): CancelablePromise<PaginatedResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hives',
            query: {
                'hiveId': hiveId,
                'apiaryId': apiaryId,
                'status': status,
                'page': page,
                'limit': limit,
            },
        });
    }

    /**
     * Create a new hive
     * @param requestBody 
     * @returns Hive Created hive
     * @throws ApiError
     */
    public static postApiV1Hives(
requestBody: CreateHiveRequest,
): CancelablePromise<Hive> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/hives',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
            },
        });
    }

    /**
     * Get a single hive
     * @param id 
     * @returns Hive Hive
     * @throws ApiError
     */
    public static getApiV1Hives1(
id: string,
): CancelablePromise<Hive> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hives/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Resource not found`,
            },
        });
    }

    /**
     * Update a hive
     * @param id 
     * @param requestBody 
     * @returns Hive Updated hive
     * @throws ApiError
     */
    public static putApiV1Hives(
id: string,
requestBody: CreateHiveRequest,
): CancelablePromise<Hive> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/hives/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Archive / delete a hive
     * @param id 
     * @returns any Archived
     * @throws ApiError
     */
    public static deleteApiV1Hives(
id: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/hives/{id}',
            path: {
                'id': id,
            },
        });
    }

}