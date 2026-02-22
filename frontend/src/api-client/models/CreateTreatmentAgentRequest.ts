/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateTreatmentAgentRequest = {
    name: string;
    category?: CreateTreatmentAgentRequest.category;
};

export namespace CreateTreatmentAgentRequest {

    export enum category {
        TREATMENT = 'treatment',
        FEEDING = 'feeding',
    }


}