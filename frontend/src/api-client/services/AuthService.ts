/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthResponse } from '../models/AuthResponse';
import type { ForgotPasswordRequest } from '../models/ForgotPasswordRequest';
import type { LoginRequest } from '../models/LoginRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { ResetPasswordRequest } from '../models/ResetPasswordRequest';
import type { User } from '../models/User';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AuthService {

    /**
     * Register a new user
     * @param requestBody 
     * @returns User User registered (email verification sent)
     * @throws ApiError
     */
    public static postApiV1AuthRegister(
requestBody: RegisterRequest,
): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
            },
        });
    }

    /**
     * Login  returns access token; sets HttpOnly refresh cookie
     * @param requestBody 
     * @returns AuthResponse Access token
     * @throws ApiError
     */
    public static postApiV1AuthLogin(
requestBody: LoginRequest,
): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
            },
        });
    }

    /**
     * Refresh access token using HttpOnly refresh cookie
     * @returns AuthResponse New access token
     * @throws ApiError
     */
    public static postApiV1AuthRefresh(): CancelablePromise<AuthResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/refresh',
        });
    }

    /**
     * Logout  clears refresh cookie
     * @returns any Logged out
     * @throws ApiError
     */
    public static postApiV1AuthLogout(): CancelablePromise<{
ok?: boolean;
}> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/logout',
        });
    }

    /**
     * Request password reset email
     * @param requestBody 
     * @returns any Email sent (always returns 200 to avoid enumeration)
     * @throws ApiError
     */
    public static postApiV1AuthForgotPassword(
requestBody: ForgotPasswordRequest,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Reset password with token from email
     * @param requestBody 
     * @returns any Password reset successful
     * @throws ApiError
     */
    public static postApiV1AuthResetPassword(
requestBody: ResetPasswordRequest,
): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request`,
            },
        });
    }

    /**
     * Verify email address (redirect link from email)
     * @param token 
     * @returns void 
     * @throws ApiError
     */
    public static getApiV1AuthVerifyEmail(
token: string,
): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/auth/verify-email',
            query: {
                'token': token,
            },
            errors: {
                302: `Redirects to /email-verified on success`,
            },
        });
    }

}