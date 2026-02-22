/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateUserRequest } from '../models/UpdateUserRequest';
import type { User } from '../models/User';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UsersService {

    /**
     * Get current user profile
     * @returns User Current user
     * @throws ApiError
     */
    public static getApiV1UsersMe(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/me',
            errors: {
                401: `Authentication required or token invalid`,
            },
        });
    }

    /**
     * Update current user profile
     * @param requestBody 
     * @returns User Updated user
     * @throws ApiError
     */
    public static putApiV1UsersMe(
requestBody: UpdateUserRequest,
): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/users/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or token invalid`,
            },
        });
    }

}