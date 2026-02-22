/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssignQueenRequest } from '../models/AssignQueenRequest';
import type { CreateQueenRequest } from '../models/CreateQueenRequest';
import type { Queen } from '../models/Queen';
import type { RemoveQueenFromHiveRequest } from '../models/RemoveQueenFromHiveRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class QueensService {

    /**
     * List queens (all or filtered by hiveId)
     * @param hiveId 
     * @returns Queen List of queens
     * @throws ApiError
     */
    public static getApiV1Queens(
hiveId?: string,
): CancelablePromise<Array<Queen>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/queens',
            query: {
                'hiveId': hiveId,
            },
        });
    }

    /**
     * Create a new queen
     * @param requestBody 
     * @returns Queen Created queen
     * @throws ApiError
     */
    public static postApiV1Queens(
requestBody: CreateQueenRequest,
): CancelablePromise<Queen> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/queens',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Get a single queen
     * @param id 
     * @returns Queen Queen
     * @throws ApiError
     */
    public static getApiV1Queens1(
id: string,
): CancelablePromise<Queen> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/queens/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Resource not found`,
            },
        });
    }

    /**
     * Update a queen
     * @param id 
     * @param requestBody 
     * @returns Queen Updated queen
     * @throws ApiError
     */
    public static putApiV1Queens(
id: string,
requestBody: CreateQueenRequest,
): CancelablePromise<Queen> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/queens/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a queen
     * @param id 
     * @returns void 
     * @throws ApiError
     */
    public static deleteApiV1Queens(
id: string,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/queens/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * Assign queen to a hive
     * @param id 
     * @param requestBody 
     * @returns Queen Updated queen with hiveHistory entry
     * @throws ApiError
     */
    public static postApiV1QueensAssign(
id: string,
requestBody: AssignQueenRequest,
): CancelablePromise<Queen> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/queens/{id}/assign',
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
     * Remove queen from current hive (status -> spare)
     * @param id 
     * @param requestBody 
     * @returns Queen Updated queen
     * @throws ApiError
     */
    public static postApiV1QueensRemoveFromHive(
id: string,
requestBody?: RemoveQueenFromHiveRequest,
): CancelablePromise<Queen> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/queens/{id}/remove-from-hive',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}