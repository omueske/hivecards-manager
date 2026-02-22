/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TreatmentAgent = {
    id?: string;
    name?: string;
    category?: TreatmentAgent.category;
};

export namespace TreatmentAgent {

    export enum category {
        TREATMENT = 'treatment',
        FEEDING = 'feeding',
    }


}