/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateInspectionRequest = {
    hiveId: string;
    date: string;
    time?: string;
    type?: CreateInspectionRequest.type;
    notes?: string;
    weather?: string;
    queenSeen?: boolean;
    broodStatus?: string;
    varroaCount?: number;
    frameCount?: number;
    treatmentAgent?: string;
    treatmentAmount?: string;
    feedingAgent?: string;
    feedingAmount?: string;
    harvestAmount?: string;
};

export namespace CreateInspectionRequest {

    export enum type {
        INSPECTION = 'inspection',
        TREATMENT = 'treatment',
        FEEDING = 'feeding',
        HARVEST = 'harvest',
        NOTE = 'note',
    }


}