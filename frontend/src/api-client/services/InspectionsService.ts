/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateInspectionRequest } from '../models/CreateInspectionRequest';
import type { Inspection } from '../models/Inspection';
import type { PaginatedResponse } from '../models/PaginatedResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class InspectionsService {

    /**
     * List inspections (filtered by hiveId, paginated)
     * @param hiveId 
     * @param page 
     * @param limit 
     * @returns PaginatedResponse Paginated list of inspections
     * @throws ApiError
     */
    public static getApiV1Inspections(
hiveId?: string,
page: number = 1,
limit: number = 25,
): CancelablePromise<PaginatedResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/inspections',
            query: {
                'hiveId': hiveId,
                'page': page,
                'limit': limit,
            },
        });
    }

    /**
     * Create a new log entry
     * @param requestBody 
     * @returns Inspection Created entry
     * @throws ApiError
     */
    public static postApiV1Inspections(
requestBody: CreateInspectionRequest,
): CancelablePromise<Inspection> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/inspections',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
            },
        });
    }

    /**
     * Update a log entry
     * @param id 
     * @param requestBody 
     * @returns Inspection Updated entry
     * @throws ApiError
     */
    public static putApiV1Inspections(
id: string,
requestBody: CreateInspectionRequest,
): CancelablePromise<Inspection> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/inspections/{id}',
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
     * Delete a log entry
     * @param id 
     * @returns void 
     * @throws ApiError
     */
    public static deleteApiV1Inspections(
id: string,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/inspections/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Resource not found`,
            },
        });
    }

}