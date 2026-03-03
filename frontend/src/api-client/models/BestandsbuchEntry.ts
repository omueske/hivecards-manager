/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type BestandsbuchEntry = {
    id?: string;
    userId?: string;
    inspectionId?: string;
    hiveId?: string;
    year?: number;
    beekeeperName?: string;
    streetHouseNumber?: string;
    postalCode?: string;
    city?: string;
    phone?: string;
    apiaryName?: string;
    operationNumber?: string;
    sheetNumber?: number;
    sequenceNo?: number;
    applicationDate?: string;
    hiveLabel?: string;
    medicineName?: string;
    supplierNameAddress?: string;
    administrationType?: string;
    amount?: string;
    withdrawalPeriod?: string;
    treatedBy?: string;
    prescribingVet?: string;
    purchaseReceipt?: string;
    treatmentDuration?: string;
    notes?: string;
    source?: BestandsbuchEntry.source;
    createdAt?: string;
    updatedAt?: string;
};

export namespace BestandsbuchEntry {

    export enum source {
        MANUAL = 'manual',
        INSPECTION_SYNC = 'inspection-sync',
    }


}