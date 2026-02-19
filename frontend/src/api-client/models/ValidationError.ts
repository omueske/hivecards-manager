/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ValidationError = {
    code?: number;
    message?: string;
    errors?: Array<{
field?: string;
message?: string;
}>;
};