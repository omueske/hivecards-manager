/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTreatmentAgentRequest } from '../models/CreateTreatmentAgentRequest';
import type { TreatmentAgent } from '../models/TreatmentAgent';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TreatmentAgentsService {

    /**
     * List custom treatment/feeding agents for the current user
     * @param category 
     * @returns TreatmentAgent List of agents
     * @throws ApiError
     */
    public static getApiV1TreatmentAgents(
category: 'treatment' | 'feeding' = 'treatment',
): CancelablePromise<Array<TreatmentAgent>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/treatment-agents',
            query: {
                'category': category,
            },
        });
    }

    /**
     * Add a custom treatment or feeding agent
     * @param requestBody 
     * @returns TreatmentAgent Created agent
     * @throws ApiError
     */
    public static postApiV1TreatmentAgents(
requestBody: CreateTreatmentAgentRequest,
): CancelablePromise<TreatmentAgent> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/treatment-agents',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Agent already exists for this user+category`,
            },
        });
    }

}