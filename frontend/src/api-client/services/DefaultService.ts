/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Apiary } from '../models/Apiary';
import type { Attachment } from '../models/Attachment';
import type { AuthLogin } from '../models/AuthLogin';
import type { AuthTokens } from '../models/AuthTokens';
import type { BreedingRecord } from '../models/BreedingRecord';
import type { Hive } from '../models/Hive';
import type { HoneyRecord } from '../models/HoneyRecord';
import type { Inspection } from '../models/Inspection';
import type { MedicationRecord } from '../models/MedicationRecord';
import type { Pagination } from '../models/Pagination';
import type { Queen } from '../models/Queen';
import type { User } from '../models/User';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * Register a new user
     * @param requestBody 
     * @returns User created
     * @throws ApiError
     */
    public static postApiV1AuthRegister(
requestBody: {
email: string;
username?: string;
password: string;
},
): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request (validation error)`,
            },
        });
    }

    /**
     * User login
     * @param requestBody 
     * @returns AuthTokens tokens
     * @throws ApiError
     */
    public static postApiV1AuthLogin(
requestBody: AuthLogin,
): CancelablePromise<AuthTokens> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request (validation error)`,
            },
        });
    }

    /**
     * Refresh tokens
     * @param requestBody 
     * @returns AuthTokens tokens
     * @throws ApiError
     */
    public static postApiV1AuthRefresh(
requestBody: {
refreshToken?: string;
},
): CancelablePromise<AuthTokens> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * List apiaries
     * @returns Apiary 
     * @throws ApiError
     */
    public static getApiV1Apiaries(): CancelablePromise<Array<Apiary>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/apiaries',
        });
    }

    /**
     * Create apiary
     * @param requestBody 
     * @returns Apiary created
     * @throws ApiError
     */
    public static postApiV1Apiaries(
requestBody: Apiary,
): CancelablePromise<Apiary> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/apiaries',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Get apiary
     * @param id 
     * @returns Apiary 
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
        });
    }

    /**
     * List hives (filtered & paginated)
     * @param apiaryId 
     * @param tag Filter by tag
     * @param status 
     * @param page Page number (starting at 1)
     * @param limit Page size
     * @param sort Sort field, prefix with - for desc
     * @returns any paginated list
     * @throws ApiError
     */
    public static getApiV1Hives(
apiaryId?: string,
tag?: string,
status?: string,
page: number = 1,
limit: number = 25,
sort?: string,
): CancelablePromise<{
pagination?: Pagination;
items?: Array<Hive>;
}> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/hives',
            query: {
                'apiaryId': apiaryId,
                'tag': tag,
                'status': status,
                'page': page,
                'limit': limit,
                'sort': sort,
            },
            errors: {
                422: `Validation failed (detailed field errors)`,
            },
        });
    }

    /**
     * Create hive (stockkarte)
     * @param requestBody 
     * @returns Hive created
     * @throws ApiError
     */
    public static postApiV1Hives(
requestBody: Hive,
): CancelablePromise<Hive> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/hives',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request (validation error)`,
                422: `Validation failed (detailed field errors)`,
            },
        });
    }

    /**
     * Get hive
     * @param id 
     * @returns Hive 
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
        });
    }

    /**
     * Update hive
     * @param id 
     * @param requestBody 
     * @returns any updated
     * @throws ApiError
     */
    public static putApiV1Hives(
id: string,
requestBody: Hive,
): CancelablePromise<any> {
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
     * Delete hive (soft)
     * @param id 
     * @returns void 
     * @throws ApiError
     */
    public static deleteApiV1Hives(
id: string,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/hives/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * List queens
     * @param hiveId 
     * @returns Queen 
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
     * Create queen
     * @param requestBody 
     * @returns Queen created
     * @throws ApiError
     */
    public static postApiV1Queens(
requestBody: Queen,
): CancelablePromise<Queen> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/queens',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request (validation error)`,
                422: `Validation failed (detailed field errors)`,
            },
        });
    }

    public static getApiV1Queens1(
id: string,
): CancelablePromise<Queen> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/queens/{id}',
            path: { 'id': id },
        });
    }

    public static putApiV1Queens(
id: string,
requestBody: Partial<Queen>,
): CancelablePromise<Queen> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/queens/{id}',
            path: { 'id': id },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static deleteApiV1Queens(
id: string,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/queens/{id}',
            path: { 'id': id },
        });
    }

    public static postApiV1QueensAssign(
id: string,
requestBody: { hiveId: string; from?: string },
): CancelablePromise<Queen> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/queens/{id}/assign',
            path: { 'id': id },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    public static postApiV1QueensRemoveFromHive(
id: string,
requestBody?: { to?: string },
): CancelablePromise<Queen> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/queens/{id}/remove-from-hive',
            path: { 'id': id },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Create breeding record
     * @param requestBody 
     * @returns BreedingRecord created
     * @throws ApiError
     */
    public static postApiV1BreedingRecords(
requestBody: BreedingRecord,
): CancelablePromise<BreedingRecord> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/breeding-records',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                422: `Validation failed (detailed field errors)`,
            },
        });
    }

    /**
     * List breeding records
     * @param hiveId 
     * @returns BreedingRecord 
     * @throws ApiError
     */
    public static getApiV1BreedingRecords(
hiveId?: string,
): CancelablePromise<Array<BreedingRecord>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/breeding-records',
            query: {
                'hiveId': hiveId,
            },
        });
    }

    /**
     * Create honey record
     * @param requestBody 
     * @returns HoneyRecord created
     * @throws ApiError
     */
    public static postApiV1HoneyRecords(
requestBody: HoneyRecord,
): CancelablePromise<HoneyRecord> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/honey-records',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                422: `Validation failed (detailed field errors)`,
            },
        });
    }

    /**
     * List honey records (filtered & paginated)
     * @param hiveId 
     * @param fromDate Filter from date (inclusive)
     * @param toDate Filter to date (inclusive)
     * @param page Page number (starting at 1)
     * @param limit Page size
     * @returns any paginated list
     * @throws ApiError
     */
    public static getApiV1HoneyRecords(
hiveId?: string,
fromDate?: string,
toDate?: string,
page: number = 1,
limit: number = 25,
): CancelablePromise<{
pagination?: Pagination;
items?: Array<HoneyRecord>;
}> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/honey-records',
            query: {
                'hiveId': hiveId,
                'fromDate': fromDate,
                'toDate': toDate,
                'page': page,
                'limit': limit,
            },
        });
    }

    /**
     * Create medication record
     * @param requestBody 
     * @returns MedicationRecord created
     * @throws ApiError
     */
    public static postApiV1MedicationRecords(
requestBody: MedicationRecord,
): CancelablePromise<MedicationRecord> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/medication-records',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                422: `Validation failed (detailed field errors)`,
            },
        });
    }

    /**
     * List medication records (filtered & paginated)
     * @param hiveId 
     * @param fromDate Filter from date (inclusive)
     * @param toDate Filter to date (inclusive)
     * @param page Page number (starting at 1)
     * @param limit Page size
     * @returns any paginated list
     * @throws ApiError
     */
    public static getApiV1MedicationRecords(
hiveId?: string,
fromDate?: string,
toDate?: string,
page: number = 1,
limit: number = 25,
): CancelablePromise<{
pagination?: Pagination;
items?: Array<MedicationRecord>;
}> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/medication-records',
            query: {
                'hiveId': hiveId,
                'fromDate': fromDate,
                'toDate': toDate,
                'page': page,
                'limit': limit,
            },
        });
    }

    /**
     * Create inspection
     * @param requestBody 
     * @returns Inspection created
     * @throws ApiError
     */
    public static postApiV1Inspections(
requestBody: Inspection,
): CancelablePromise<Inspection> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/inspections',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
                422: `Validation failed (detailed field errors)`,
            },
        });
    }

    /**
     * List inspections (filtered & paginated)
     * @param hiveId 
     * @param fromDate Filter from date (inclusive)
     * @param toDate Filter to date (inclusive)
     * @param page Page number (starting at 1)
     * @param limit Page size
     * @returns any paginated list
     * @throws ApiError
     */
    public static getApiV1Inspections(
hiveId?: string,
fromDate?: string,
toDate?: string,
page: number = 1,
limit: number = 25,
): CancelablePromise<{
pagination?: Pagination;
items?: Array<Inspection>;
}> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/inspections',
            query: {
                'hiveId': hiveId,
                'fromDate': fromDate,
                'toDate': toDate,
                'page': page,
                'limit': limit,
            },
        });
    }

    /**
     * Update inspection
     * @param id Inspection ID
     * @param requestBody 
     * @returns Inspection updated
     * @throws ApiError
     */
    public static putApiV1Inspections(
id: string,
requestBody: Inspection,
): CancelablePromise<Inspection> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/inspections/{id}',
            path: { 'id': id },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete inspection
     * @param id Inspection ID
     * @returns void
     * @throws ApiError
     */
    public static deleteApiV1Inspections(
id: string,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/inspections/{id}',
            path: { 'id': id },
        });
    }

    /**
     * Upload attachment for hive
     * @param id 
     * @param formData 
     * @returns Attachment file uploaded
     * @throws ApiError
     */
    public static postApiV1HivesAttachments(
id: string,
formData: {
file?: Blob;
},
): CancelablePromise<Attachment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/hives/{id}/attachments',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid request`,
            },
        });
    }

    /**
     * Upload attachment for queen
     * @param id 
     * @param formData 
     * @returns Attachment file uploaded
     * @throws ApiError
     */
    public static postApiV1QueensAttachments(
id: string,
formData: {
file?: Blob;
},
): CancelablePromise<Attachment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/queens/{id}/attachments',
            path: {
                'id': id,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid request`,
            },
        });
    }

}