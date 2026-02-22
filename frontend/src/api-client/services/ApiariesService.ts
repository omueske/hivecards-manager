/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Apiary } from '../models/Apiary';
import type { CreateApiaryRequest } from '../models/CreateApiaryRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ApiariesService {

    /**
     * List all apiaries of the current user
     * @returns Apiary List of apiaries
     * @throws ApiError
     */
    public static getApiV1Apiaries(): CancelablePromise<Array<Apiary>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/apiaries',
            errors: {
                401: `Authentication required or token invalid`,
            },
        });
    }

    /**
     * Create a new apiary
     * @param requestBody 
     * @returns Apiary Created apiary
     * @throws ApiError
     */
    public static postApiV1Apiaries(
requestBody: CreateApiaryRequest,
): CancelablePromise<Apiary> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/apiaries',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Get a single apiary
     * @param id 
     * @returns Apiary Apiary
     * @throws ApiError
     */
    public static getApiV1Apiaries1(
id: string,
): CancelablePromise<Apiary> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/apiaries/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Resource not found`,
            },
        });
    }

    /**
     * Update an apiary
     * @param id 
     * @param requestBody 
     * @returns Apiary Updated apiary
     * @throws ApiError
     */
    public static putApiV1Apiaries(
id: string,
requestBody: CreateApiaryRequest,
): CancelablePromise<Apiary> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/apiaries/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete an apiary
     * @param id 
     * @returns any Deleted
     * @throws ApiError
     */
    public static deleteApiV1Apiaries(
id: string,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/apiaries/{id}',
            path: {
                'id': id,
            },
        });
    }

}