/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateHiveRequest = {
    apiaryId?: string;
    hiveNumber: string;
    status?: CreateHiveRequest.status;
    frameCount?: number;
    installationDate?: string;
    notes?: string;
    hiveBoxType?: string;
    hiveType?: string;
    queenYear?: number;
    queenColor?: string;
    queenOrigin?: string;
    matingType?: string;
    queenMarked?: boolean;
};

export namespace CreateHiveRequest {

    export enum status {
        ACTIVE = 'active',
        INACTIVE = 'inactive',
        ARCHIVED = 'archived',
    }


}