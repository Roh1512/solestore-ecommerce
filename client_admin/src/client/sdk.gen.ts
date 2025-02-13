// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type OptionsLegacyParser, urlSearchParamsBodySerializer, formDataBodySerializer } from '@hey-api/client-fetch';
import type { AuthCreateNewUserData, AuthCreateNewUserError, AuthCreateNewUserResponse, AuthLoginData, AuthLoginError, AuthLoginResponse, AuthGoogleCallbackError, AuthGoogleCallbackResponse, AuthLogoutError, AuthLogoutResponse, AuthLogoutAllError, AuthLogoutAllResponse, AuthCheckAuthError, AuthCheckAuthResponse, AuthRefreshTokenRouteError, AuthRefreshTokenRouteResponse, ProfileGetProfileDetailsError, ProfileGetProfileDetailsResponse, ProfileUpdateProfileDetailsData, ProfileUpdateProfileDetailsError, ProfileUpdateProfileDetailsResponse, ProfileUpdateContactInfoData, ProfileUpdateContactInfoError, ProfileUpdateContactInfoResponse, ProfileUpdateProfileImageRouteData, ProfileUpdateProfileImageRouteError, ProfileUpdateProfileImageRouteResponse, BrandGetAllBrandsData, BrandGetAllBrandsError, BrandGetAllBrandsResponse, CategoryGetAllCategoriesData, CategoryGetAllCategoriesError, CategoryGetAllCategoriesResponse, AdminAdminGetError, AdminAdminGetResponse, AdminCreateNewAdminData, AdminCreateNewAdminError, AdminCreateNewAdminResponse, AdminAdminLoginData, AdminAdminLoginError, AdminAdminLoginResponse, AdminAdminLogoutError, AdminAdminLogoutResponse, AdminAdminLogoutAllError, AdminAdminLogoutAllResponse, AdminProtectedError, AdminProtectedResponse, AdminAdminRefreshTokenRouteError, AdminAdminRefreshTokenRouteResponse, AdminGetAdminProfileDetailsError, AdminGetAdminProfileDetailsResponse, AdminUpdateAdminProfileDetailsData, AdminUpdateAdminProfileDetailsError, AdminUpdateAdminProfileDetailsResponse, AdminUpdateAdminRoleRouteData, AdminUpdateAdminRoleRouteError, AdminUpdateAdminRoleRouteResponse, AdminUpdateAdminProfileImageRouteData, AdminUpdateAdminProfileImageRouteError, AdminUpdateAdminProfileImageRouteResponse, AdminGetAllBrandsData, AdminGetAllBrandsError, AdminGetAllBrandsResponse, AdminBrandCreateData, AdminBrandCreateError, AdminBrandCreateResponse, AdminBrandUpdateData, AdminBrandUpdateError, AdminBrandUpdateResponse, AdminBrandDeleteData, AdminBrandDeleteError, AdminBrandDeleteResponse, AdminGetAllCategoriesData, AdminGetAllCategoriesError, AdminGetAllCategoriesResponse, AdminCategoryCreateData, AdminCategoryCreateError, AdminCategoryCreateResponse, AdminCategoryUpdateData, AdminCategoryUpdateError, AdminCategoryUpdateResponse, AdminCategoryDeleteData, AdminCategoryDeleteError, AdminCategoryDeleteResponse, AdminGetAdminsData, AdminGetAdminsError, AdminGetAdminsResponse, AdminGetAdminData, AdminGetAdminError, AdminGetAdminResponse, AdminAdminDeleteData, AdminAdminDeleteError, AdminAdminDeleteResponse, AdminUpdateOtherAdminRoleData, AdminUpdateOtherAdminRoleError, AdminUpdateOtherAdminRoleResponse, AdminGetAllProductsAdminData, AdminGetAllProductsAdminError, AdminGetAllProductsAdminResponse, AdminProductCreateData, AdminProductCreateError, AdminProductCreateResponse, AdminDeleteMultipleProductsData, AdminDeleteMultipleProductsError, AdminDeleteMultipleProductsResponse, AdminProductByIdData, AdminProductByIdError, AdminProductByIdResponse, AdminProdcutDetailsUpdateData, AdminProdcutDetailsUpdateError, AdminProdcutDetailsUpdateResponse, AdminDeleteProductData, AdminDeleteProductError, AdminDeleteProductResponse, AdminProductSizeStockUpdateData, AdminProductSizeStockUpdateError, AdminProductSizeStockUpdateResponse, AdminAddImagesData, AdminAddImagesError, AdminAddImagesResponse, AdminDeleteImagesData, AdminDeleteImagesError, AdminDeleteImagesResponse, ServeAdminReactAppData, ServeAdminReactAppError, ServeAdminReactAppResponse, ServeReactAppData, ServeReactAppError, ServeReactAppResponse } from './types.gen';

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
 * Google Callback
 */
export const authGoogleCallback = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).post<AuthGoogleCallbackResponse, AuthGoogleCallbackError, ThrowOnError>({
        ...options,
        url: '/api/auth/google/login'
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
 * Get All Brands
 * GET ALL BRANDS ROUTE
 */
export const brandGetAllBrands = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<BrandGetAllBrandsData, ThrowOnError>) => {
    return (options?.client ?? client).get<BrandGetAllBrandsResponse, BrandGetAllBrandsError, ThrowOnError>({
        ...options,
        url: '/api/brand/'
    });
};

/**
 * Get All Categories
 * Get all categories route
 */
export const categoryGetAllCategories = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<CategoryGetAllCategoriesData, ThrowOnError>) => {
    return (options?.client ?? client).get<CategoryGetAllCategoriesResponse, CategoryGetAllCategoriesError, ThrowOnError>({
        ...options,
        url: '/api/category/'
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
        url: '/api/admin/profile/update-admin-role'
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
 * Get All Brands
 * GET ALL BRANDS ROUTE
 */
export const adminGetAllBrands = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<AdminGetAllBrandsData, ThrowOnError>) => {
    return (options?.client ?? client).get<AdminGetAllBrandsResponse, AdminGetAllBrandsError, ThrowOnError>({
        ...options,
        url: '/api/admin/brand/'
    });
};

/**
 * Brand Create
 * Brand create route
 */
export const adminBrandCreate = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminBrandCreateData, ThrowOnError>) => {
    return (options?.client ?? client).post<AdminBrandCreateResponse, AdminBrandCreateError, ThrowOnError>({
        ...options,
        url: '/api/admin/brand/'
    });
};

/**
 * Brand Update
 */
export const adminBrandUpdate = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminBrandUpdateData, ThrowOnError>) => {
    return (options?.client ?? client).put<AdminBrandUpdateResponse, AdminBrandUpdateError, ThrowOnError>({
        ...options,
        url: '/api/admin/brand/{brand_id}'
    });
};

/**
 * Brand Delete
 */
export const adminBrandDelete = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminBrandDeleteData, ThrowOnError>) => {
    return (options?.client ?? client).delete<AdminBrandDeleteResponse, AdminBrandDeleteError, ThrowOnError>({
        ...options,
        url: '/api/admin/brand/{brand_id}'
    });
};

/**
 * Get All Categories
 * Get all categories route
 */
export const adminGetAllCategories = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<AdminGetAllCategoriesData, ThrowOnError>) => {
    return (options?.client ?? client).get<AdminGetAllCategoriesResponse, AdminGetAllCategoriesError, ThrowOnError>({
        ...options,
        url: '/api/admin/category/'
    });
};

/**
 * Category Create
 */
export const adminCategoryCreate = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminCategoryCreateData, ThrowOnError>) => {
    return (options?.client ?? client).post<AdminCategoryCreateResponse, AdminCategoryCreateError, ThrowOnError>({
        ...options,
        url: '/api/admin/category/'
    });
};

/**
 * Category Update
 */
export const adminCategoryUpdate = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminCategoryUpdateData, ThrowOnError>) => {
    return (options?.client ?? client).put<AdminCategoryUpdateResponse, AdminCategoryUpdateError, ThrowOnError>({
        ...options,
        url: '/api/admin/category/{category_id}'
    });
};

/**
 * Category Delete
 */
export const adminCategoryDelete = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminCategoryDeleteData, ThrowOnError>) => {
    return (options?.client ?? client).delete<AdminCategoryDeleteResponse, AdminCategoryDeleteError, ThrowOnError>({
        ...options,
        url: '/api/admin/category/{category_id}'
    });
};

/**
 * Get Admins
 * Get all admins
 */
export const adminGetAdmins = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<AdminGetAdminsData, ThrowOnError>) => {
    return (options?.client ?? client).get<AdminGetAdminsResponse, AdminGetAdminsError, ThrowOnError>({
        ...options,
        url: '/api/admin/admincrud/'
    });
};

/**
 * Get Admin
 * Function to get individual admin
 */
export const adminGetAdmin = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminGetAdminData, ThrowOnError>) => {
    return (options?.client ?? client).get<AdminGetAdminResponse, AdminGetAdminError, ThrowOnError>({
        ...options,
        url: '/api/admin/admincrud/{admin_id}'
    });
};

/**
 * Admin Delete
 */
export const adminAdminDelete = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminAdminDeleteData, ThrowOnError>) => {
    return (options?.client ?? client).delete<AdminAdminDeleteResponse, AdminAdminDeleteError, ThrowOnError>({
        ...options,
        url: '/api/admin/admincrud/{admin_id}'
    });
};

/**
 * Update Other Admin Role
 * Update role route
 */
export const adminUpdateOtherAdminRole = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminUpdateOtherAdminRoleData, ThrowOnError>) => {
    return (options?.client ?? client).put<AdminUpdateOtherAdminRoleResponse, AdminUpdateOtherAdminRoleError, ThrowOnError>({
        ...options,
        url: '/api/admin/admincrud/update-role/{admin_id}'
    });
};

/**
 * Get All Products Admin
 * Get all products route
 */
export const adminGetAllProductsAdmin = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<AdminGetAllProductsAdminData, ThrowOnError>) => {
    return (options?.client ?? client).get<AdminGetAllProductsAdminResponse, AdminGetAllProductsAdminError, ThrowOnError>({
        ...options,
        url: '/api/admin/product/'
    });
};

/**
 * Product Create
 * Add product route
 */
export const adminProductCreate = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminProductCreateData, ThrowOnError>) => {
    return (options?.client ?? client).post<AdminProductCreateResponse, AdminProductCreateError, ThrowOnError>({
        ...options,
        url: '/api/admin/product/'
    });
};

/**
 * Delete Multiple Products
 * Route to delete multiple products
 */
export const adminDeleteMultipleProducts = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminDeleteMultipleProductsData, ThrowOnError>) => {
    return (options?.client ?? client).delete<AdminDeleteMultipleProductsResponse, AdminDeleteMultipleProductsError, ThrowOnError>({
        ...options,
        url: '/api/admin/product/delete-products'
    });
};

/**
 * Product By Id
 */
export const adminProductById = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminProductByIdData, ThrowOnError>) => {
    return (options?.client ?? client).get<AdminProductByIdResponse, AdminProductByIdError, ThrowOnError>({
        ...options,
        url: '/api/admin/product/{product_id}'
    });
};

/**
 * Prodcut Details Update
 * Update product details route
 */
export const adminProdcutDetailsUpdate = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminProdcutDetailsUpdateData, ThrowOnError>) => {
    return (options?.client ?? client).put<AdminProdcutDetailsUpdateResponse, AdminProdcutDetailsUpdateError, ThrowOnError>({
        ...options,
        url: '/api/admin/product/{product_id}'
    });
};

/**
 * Delete Product
 * ROute to delete a single product
 */
export const adminDeleteProduct = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminDeleteProductData, ThrowOnError>) => {
    return (options?.client ?? client).delete<AdminDeleteProductResponse, AdminDeleteProductError, ThrowOnError>({
        ...options,
        url: '/api/admin/product/{product_id}'
    });
};

/**
 * Product Size Stock Update
 */
export const adminProductSizeStockUpdate = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminProductSizeStockUpdateData, ThrowOnError>) => {
    return (options?.client ?? client).put<AdminProductSizeStockUpdateResponse, AdminProductSizeStockUpdateError, ThrowOnError>({
        ...options,
        url: '/api/admin/product/{product_id}/update-size-stock'
    });
};

/**
 * Add Images
 * Add image product route
 */
export const adminAddImages = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminAddImagesData, ThrowOnError>) => {
    return (options?.client ?? client).put<AdminAddImagesResponse, AdminAddImagesError, ThrowOnError>({
        ...options,
        ...formDataBodySerializer,
        headers: {
            'Content-Type': null,
            ...options?.headers
        },
        url: '/api/admin/product/{product_id}/add-image'
    });
};

/**
 * Delete Images
 * Delete image product route
 */
export const adminDeleteImages = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<AdminDeleteImagesData, ThrowOnError>) => {
    return (options?.client ?? client).put<AdminDeleteImagesResponse, AdminDeleteImagesError, ThrowOnError>({
        ...options,
        url: '/api/admin/product/{product_id}/delete-images'
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