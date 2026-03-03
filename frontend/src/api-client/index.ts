/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export { ApiError } from './core/ApiError';
export { CancelablePromise, CancelError } from './core/CancelablePromise';
export { OpenAPI } from './core/OpenAPI';
export type { OpenAPIConfig } from './core/OpenAPI';

export type { Apiary } from './models/Apiary';
export type { AssignQueenRequest } from './models/AssignQueenRequest';
export type { AuthResponse } from './models/AuthResponse';
export { BestandsbuchEntry } from './models/BestandsbuchEntry';
export type { CreateApiaryRequest } from './models/CreateApiaryRequest';
export { CreateBestandsbuchEntryRequest } from './models/CreateBestandsbuchEntryRequest';
export { CreateHiveRequest } from './models/CreateHiveRequest';
export { CreateInspectionRequest } from './models/CreateInspectionRequest';
export { CreateQueenRequest } from './models/CreateQueenRequest';
export { CreateTreatmentAgentRequest } from './models/CreateTreatmentAgentRequest';
export type { Error } from './models/Error';
export type { ForgotPasswordRequest } from './models/ForgotPasswordRequest';
export { Hive } from './models/Hive';
export type { HiveHistoryEntry } from './models/HiveHistoryEntry';
export { Inspection } from './models/Inspection';
export type { LoginRequest } from './models/LoginRequest';
export type { PaginatedResponse } from './models/PaginatedResponse';
export { Queen } from './models/Queen';
export type { RegisterRequest } from './models/RegisterRequest';
export type { RemoveQueenFromHiveRequest } from './models/RemoveQueenFromHiveRequest';
export type { ResetPasswordRequest } from './models/ResetPasswordRequest';
export { TreatmentAgent } from './models/TreatmentAgent';
export type { UpdateUserRequest } from './models/UpdateUserRequest';
export type { User } from './models/User';

export { ApiariesService } from './services/ApiariesService';
export { AuthService } from './services/AuthService';
export { BestandsbuchService } from './services/BestandsbuchService';
export { HivesService } from './services/HivesService';
export { InspectionsService } from './services/InspectionsService';
export { QueensService } from './services/QueensService';
export { TreatmentAgentsService } from './services/TreatmentAgentsService';
export { UsersService } from './services/UsersService';
