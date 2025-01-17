// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type OptionsLegacyParser, urlSearchParamsBodySerializer, formDataBodySerializer } from '@hey-api/client-fetch';
import type { AuthCreateNewUserData, AuthCreateNewUserError, AuthCreateNewUserResponse, AuthLoginData, AuthLoginError, AuthLoginResponse, AuthLogoutError, AuthLogoutResponse, AuthLogoutAllError, AuthLogoutAllResponse, AuthCheckAuthError, AuthCheckAuthResponse, AuthRefreshTokenRouteError, AuthRefreshTokenRouteResponse, ProfileGetProfileDetailsError, ProfileGetProfileDetailsResponse, ProfileUpdateProfileDetailsData, ProfileUpdateProfileDetailsError, ProfileUpdateProfileDetailsResponse, ProfileUpdateContactInfoData, ProfileUpdateContactInfoError, ProfileUpdateContactInfoResponse, ProfileUpdateProfileImageRouteData, ProfileUpdateProfileImageRouteError, ProfileUpdateProfileImageRouteResponse, AdminAdminGetError, AdminAdminGetResponse, AdminCreateNewAdminData, AdminCreateNewAdminError, AdminCreateNewAdminResponse, AdminAdminLoginData, AdminAdminLoginError, AdminAdminLoginResponse, AdminAdminLogoutError, AdminAdminLogoutResponse, AdminAdminLogoutAllError, AdminAdminLogoutAllResponse, AdminProtectedError, AdminProtectedResponse, AdminAdminRefreshTokenRouteError, AdminAdminRefreshTokenRouteResponse, AdminGetAdminProfileDetailsError, AdminGetAdminProfileDetailsResponse, AdminUpdateAdminProfileDetailsData, AdminUpdateAdminProfileDetailsError, AdminUpdateAdminProfileDetailsResponse, AdminUpdateAdminRoleRouteData, AdminUpdateAdminRoleRouteError, AdminUpdateAdminRoleRouteResponse, AdminUpdateAdminProfileImageRouteData, AdminUpdateAdminProfileImageRouteError, AdminUpdateAdminProfileImageRouteResponse, ServeAdminReactAppData, ServeAdminReactAppError, ServeAdminReactAppResponse, ServeReactAppData, ServeReactAppError, ServeReactAppResponse } from './types.gen';

export const client = createClient(createConfig());

/**
 * Create New User
 * Create a new user and sign up
 */
export const authCreateNewUser = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AuthCreateNewUserData, ThrowOnError>) => {
    return (options?.client ?? client).post<AuthCreateNewUserResponse, AuthCreateNewUserError, ThrowOnError>({
        ...options,
        url: '/api/auth/register'
    });
};

/**
 * Login
 */
export const authLogin = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AuthLoginData, ThrowOnError>) => {
    return (options?.client ?? client).post<AuthLoginResponse, AuthLoginError, ThrowOnError>({
        ...options,
        ...urlSearchParamsBodySerializer,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...options?.headers
        },
        url: '/api/auth/login'
    });
};

/**
 * Logout
 */
export const authLogout = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).post<AuthLogoutResponse, AuthLogoutError, ThrowOnError>({
        ...options,
        url: '/api/auth/logout'
    });
};

/**
 * Logout All
 */
export const authLogoutAll = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).post<AuthLogoutAllResponse, AuthLogoutAllError, ThrowOnError>({
        ...options,
        url: '/api/auth/logoutall'
    });
};

/**
 * Check Auth
 */
export const authCheckAuth = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).get<AuthCheckAuthResponse, AuthCheckAuthError, ThrowOnError>({
        ...options,
        url: '/api/auth/checkauth'
    });
};

/**
 * Refresh Token Route
 */
export const authRefreshTokenRoute = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).post<AuthRefreshTokenRouteResponse, AuthRefreshTokenRouteError, ThrowOnError>({
        ...options,
        url: '/api/auth/refresh'
    });
};

/**
 * Get Profile Details
 */
export const profileGetProfileDetails = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).get<ProfileGetProfileDetailsResponse, ProfileGetProfileDetailsError, ThrowOnError>({
        ...options,
        url: '/api/profile/'
    });
};

/**
 * Update Profile Details
 */
export const profileUpdateProfileDetails = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<ProfileUpdateProfileDetailsData, ThrowOnError>) => {
    return (options?.client ?? client).put<ProfileUpdateProfileDetailsResponse, ProfileUpdateProfileDetailsError, ThrowOnError>({
        ...options,
        url: '/api/profile/'
    });
};

/**
 * Update Contact Info
 */
export const profileUpdateContactInfo = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<ProfileUpdateContactInfoData, ThrowOnError>) => {
    return (options?.client ?? client).put<ProfileUpdateContactInfoResponse, ProfileUpdateContactInfoError, ThrowOnError>({
        ...options,
        url: '/api/profile/update-contact-info'
    });
};

/**
 * Update Profile Image Route
 */
export const profileUpdateProfileImageRoute = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<ProfileUpdateProfileImageRouteData, ThrowOnError>) => {
    return (options?.client ?? client).post<ProfileUpdateProfileImageRouteResponse, ProfileUpdateProfileImageRouteError, ThrowOnError>({
        ...options,
        ...formDataBodySerializer,
        headers: {
            'Content-Type': null,
            ...options?.headers
        },
        url: '/api/profile/update-profile-img'
    });
};

/**
 * Admin Get
 */
export const adminAdminGet = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).get<AdminAdminGetResponse, AdminAdminGetError, ThrowOnError>({
        ...options,
        url: '/api/admin/'
    });
};

/**
 * Create New Admin
 * Create a new admin and sign up
 */
export const adminCreateNewAdmin = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminCreateNewAdminData, ThrowOnError>) => {
    return (options?.client ?? client).post<AdminCreateNewAdminResponse, AdminCreateNewAdminError, ThrowOnError>({
        ...options,
        url: '/api/admin/auth/register'
    });
};

/**
 * Admin Login
 */
export const adminAdminLogin = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminAdminLoginData, ThrowOnError>) => {
    return (options?.client ?? client).post<AdminAdminLoginResponse, AdminAdminLoginError, ThrowOnError>({
        ...options,
        ...urlSearchParamsBodySerializer,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...options?.headers
        },
        url: '/api/admin/auth/login'
    });
};

/**
 * Admin Logout
 */
export const adminAdminLogout = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).post<AdminAdminLogoutResponse, AdminAdminLogoutError, ThrowOnError>({
        ...options,
        url: '/api/admin/auth/logout'
    });
};

/**
 * Admin Logout All
 */
export const adminAdminLogoutAll = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).post<AdminAdminLogoutAllResponse, AdminAdminLogoutAllError, ThrowOnError>({
        ...options,
        url: '/api/admin/auth/logoutall'
    });
};

/**
 * Protected
 */
export const adminProtected = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).get<AdminProtectedResponse, AdminProtectedError, ThrowOnError>({
        ...options,
        url: '/api/admin/auth/checkauth'
    });
};

/**
 * Admin Refresh Token Route
 */
export const adminAdminRefreshTokenRoute = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).post<AdminAdminRefreshTokenRouteResponse, AdminAdminRefreshTokenRouteError, ThrowOnError>({
        ...options,
        url: '/api/admin/auth/refresh'
    });
};

/**
 * Get Admin Profile Details
 */
export const adminGetAdminProfileDetails = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).get<AdminGetAdminProfileDetailsResponse, AdminGetAdminProfileDetailsError, ThrowOnError>({
        ...options,
        url: '/api/admin/profile/'
    });
};

/**
 * Update Admin Profile Details
 */
export const adminUpdateAdminProfileDetails = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminUpdateAdminProfileDetailsData, ThrowOnError>) => {
    return (options?.client ?? client).put<AdminUpdateAdminProfileDetailsResponse, AdminUpdateAdminProfileDetailsError, ThrowOnError>({
        ...options,
        url: '/api/admin/profile/'
    });
};

/**
 * Update Admin Role Route
 */
export const adminUpdateAdminRoleRoute = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminUpdateAdminRoleRouteData, ThrowOnError>) => {
    return (options?.client ?? client).put<AdminUpdateAdminRoleRouteResponse, AdminUpdateAdminRoleRouteError, ThrowOnError>({
        ...options,
        url: '/api/admin/profile/update-admin-role/{admin_id}'
    });
};

/**
 * Update Admin Profile Image Route
 */
export const adminUpdateAdminProfileImageRoute = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminUpdateAdminProfileImageRouteData, ThrowOnError>) => {
    return (options?.client ?? client).post<AdminUpdateAdminProfileImageRouteResponse, AdminUpdateAdminProfileImageRouteError, ThrowOnError>({
        ...options,
        ...formDataBodySerializer,
        headers: {
            'Content-Type': null,
            ...options?.headers
        },
        url: '/api/admin/profile/update-profile-img'
    });
};

/**
 * Serve Admin React App
 */
export const serveAdminReactApp = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<ServeAdminReactAppData, ThrowOnError>) => {
    return (options?.client ?? client).get<ServeAdminReactAppResponse, ServeAdminReactAppError, ThrowOnError>({
        ...options,
        url: '/admin{full_path}'
    });
};

/**
 * Serve React App
 */
export const serveReactApp = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<ServeReactAppData, ThrowOnError>) => {
    return (options?.client ?? client).get<ServeReactAppResponse, ServeReactAppError, ThrowOnError>({
        ...options,
        url: '/{full_path}'
    });
};