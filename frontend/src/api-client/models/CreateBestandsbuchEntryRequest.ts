/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateBestandsbuchEntryRequest = {
    source?: CreateBestandsbuchEntryRequest.source;
    inspectionId?: string;
    hiveId?: string;
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
    year?: number;
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
};

export namespace CreateBestandsbuchEntryRequest {

    export enum source {
        MANUAL = 'manual',
        INSPECTION_SYNC = 'inspection-sync',
    }


}