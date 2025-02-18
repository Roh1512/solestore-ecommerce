// This file is auto-generated by @hey-api/openapi-ts

/**
 * Request model to add to cart
 */
export type AddToCartRequest = {
    product_id: string;
    size: number;
    quantity: number;
};

export type AdminCreateRequest = {
    username: string;
    email: string;
    password: string;
    name?: (string | null);
    phone?: (string | null);
    role?: AdminRole;
};

export type AdminResponse = {
    _id: string;
    username: string;
    name?: (string | null);
    email: string;
    profile_img_url?: (string | null);
    profile_img_public_id?: (string | null);
    role: AdminRole;
    phone?: (string | null);
    created_at: string;
    updated_at: string;
};

export type AdminRole = 'ADMIN' | 'ORDER_MANAGER' | 'PRODUCT_MANAGER';

export type AdminRoleUpdateRequest = {
    role: AdminRole;
};

export type AdminUpdateRequest = {
    username?: (string | null);
    email?: (string | null);
    password?: (string | null);
    name?: (string | null);
    phone?: (string | null);
};

export type Body_admin_add_images = {
    images: Array<((Blob | File))>;
};

export type Body_admin_admin_login = {
    grant_type?: (string | null);
    username: string;
    password: string;
    scope?: string;
    client_id?: (string | null);
    client_secret?: (string | null);
};

export type Body_admin_update_admin_profile_details = {
    profile_details: AdminUpdateRequest;
    current_password: string;
};

export type Body_admin_update_admin_profile_image_route = {
    file: (Blob | File);
};

export type Body_auth_login = {
    grant_type?: (string | null);
    username: string;
    password: string;
    scope?: string;
    client_id?: (string | null);
    client_secret?: (string | null);
};

export type Body_profile_update_contact_info = {
    contact_info: UpdateContactInfoRequest;
    current_password: string;
};

export type Body_profile_update_profile_details = {
    profile_details: UpdateProfileRequest;
    current_password: string;
};

export type Body_profile_update_profile_image_route = {
    file: (Blob | File);
};

/**
 * Create brand request model
 */
export type BrandCreateRequest = {
    title: string;
};

/**
 * Brand Response model
 */
export type BrandResponse = {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
};

export type CartItemResponse = {
    id: string;
    user_id: string;
    product_id: string;
    title: string;
    price: number;
    size: number;
    quantity: number;
    image_url?: (string | null);
    created_at: string;
    updated_at: string;
};

export type CartResponse = {
    items: Array<CartItemResponse>;
    total_price: number;
    total_count: number;
};

/**
 * Create Category request model
 */
export type CategoryCreateRequest = {
    title: string;
};

/**
 * Category response model
 */
export type CategoryResponse = {
    id: string;
    title: string;
    updated_at: string;
};

/**
 * Request data to change item quantity in cart
 */
export type ChangeItemQtyRequest = {
    product_id: string;
    size: number;
    quantity: number;
};

export type DeleteImagesRequest = {
    public_ids: Array<(string)>;
};

export type DeleteProductsRequests = {
    product_ids: Array<(string)>;
};

export type HTTPValidationError = {
    detail?: Array<ValidationError>;
};

export type Image = {
    url: string;
    public_id: string;
};

/**
 * Product create request body
 */
export type ProductCreateRequest = {
    title: string;
    /**
     * Description must be at least 5 characters long
     */
    description?: (string | null);
    /**
     * Price must be greater than 0
     */
    price: number;
    /**
     * Brand ID
     */
    brand: string;
    /**
     * Category ID
     */
    category: string;
    sizes?: (Array<Size> | null);
};

/**
 * Product create request body
 */
export type ProductDetailsRequest = {
    title?: (string | null);
    /**
     * Description must be at least 5 characters long
     */
    description?: (string | null);
    /**
     * Price must be greater than 0
     */
    price?: (number | null);
    /**
     * Brand ID
     */
    brand?: (string | null);
    /**
     * Category ID
     */
    category?: (string | null);
};

export type ProductResponse = {
    id: string;
    title: string;
    description?: (string | null);
    price: number;
    brand: BrandResponse;
    category: CategoryResponse;
    images?: Array<Image>;
    sizes: Array<Size>;
    created_at: string;
    updated_at: string;
};

/**
 * Request model to update size and stock
 */
export type ProductSizeStockRequest = {
    /**
     * List of sizes and their stock values to update
     */
    sizes: Array<Size>;
};

export type Size = {
    size: number;
    stock?: number;
};

export type SortBy = 'title' | 'date';

export type SortByAdmin = 'username' | 'email' | 'name' | 'date';

export type SortByProduct = 'price' | 'date';

export type SortOrder = 'desc' | 'asc';

export type SuccessMessage = {
    message?: string;
};

export type Token = {
    access_token: string;
    token_type: string;
};

/**
 * Contact info update request model
 */
export type UpdateContactInfoRequest = {
    /**
     * Phone number with 10 digits or including country code (e.g., +1234567890)
     */
    phone?: (string | null);
    /**
     * Residential address
     */
    address?: (string | null);
};

/**
 * User profile update request
 */
export type UpdateProfileRequest = {
    /**
     * Username must be 3-30 characters long and can only contain letters, numbers, and underscores.
     */
    username?: (string | null);
    /**
     * A valid email address is required.
     */
    email?: (string | null);
    /**
     * Name must be between 1 and 50 characters.
     */
    name?: (string | null);
    password?: (string | null);
};

/**
 * Create user request model
 */
export type UserCreateRequest = {
    /**
     * Username must be 3-30 characters long and can only contain letters, numbers, and underscores.
     */
    username: string;
    /**
     * A valid email address is required.
     */
    email: string;
    /**
     * Password must be between 8 and 128 characters.
     */
    password: string;
    /**
     * Name must be between 5 and 50 characters.
     */
    name?: (string | null);
    /**
     * Address can be up to 255 characters long.
     */
    address?: (string | null);
    /**
     * Phone number must be in E.164 format (e.g., +1234567890).
     */
    phone?: (string | null);
};

/**
 * User Response to client
 */
export type UserResponse = {
    _id: string;
    username: string;
    name?: (string | null);
    email: string;
    profile_img_url?: (string | null);
    profile_img_public_id?: (string | null);
    address?: (string | null);
    phone?: (string | null);
    google_id?: (string | null);
    created_at: string;
    updated_at: string;
};

export type ValidationError = {
    loc: Array<(string | number)>;
    msg: string;
    type: string;
};

export type AuthCreateNewUserData = {
    body: UserCreateRequest;
};

export type AuthCreateNewUserResponse = (UserResponse);

export type AuthCreateNewUserError = (HTTPValidationError);

export type AuthLoginData = {
    body: Body_auth_login;
};

export type AuthLoginResponse = (Token);

export type AuthLoginError = (HTTPValidationError);

export type AuthGoogleCallbackResponse = (unknown);

export type AuthGoogleCallbackError = unknown;

export type AuthLogoutResponse = (unknown);

export type AuthLogoutError = unknown;

export type AuthLogoutAllResponse = (unknown);

export type AuthLogoutAllError = unknown;

export type AuthCheckAuthResponse = (unknown);

export type AuthCheckAuthError = unknown;

export type AuthRefreshTokenRouteResponse = (Token);

export type AuthRefreshTokenRouteError = unknown;

export type ProfileGetProfileDetailsResponse = (UserResponse);

export type ProfileGetProfileDetailsError = unknown;

export type ProfileUpdateProfileDetailsData = {
    body: Body_profile_update_profile_details;
};

export type ProfileUpdateProfileDetailsResponse = (UserResponse);

export type ProfileUpdateProfileDetailsError = (HTTPValidationError);

export type ProfileUpdateContactInfoData = {
    body: Body_profile_update_contact_info;
};

export type ProfileUpdateContactInfoResponse = (UserResponse);

export type ProfileUpdateContactInfoError = (HTTPValidationError);

export type ProfileUpdateProfileImageRouteData = {
    body: Body_profile_update_profile_image_route;
};

export type ProfileUpdateProfileImageRouteResponse = (UserResponse);

export type ProfileUpdateProfileImageRouteError = (HTTPValidationError);

export type BrandGetAllBrandsData = {
    query?: {
        /**
         * Number of records to return
         */
        limit?: number;
        /**
         * Search term for brand title
         */
        search?: (string | null);
        /**
         * Number of records to skip
         */
        skip?: number;
        /**
         * Field to sort by (date or title)
         */
        sort_by?: SortBy;
        /**
         * Sort order (asc or desc)
         */
        sort_order?: SortOrder;
    };
};

export type BrandGetAllBrandsResponse = (Array<BrandResponse>);

export type BrandGetAllBrandsError = (HTTPValidationError);

export type CategoryGetAllCategoriesData = {
    query?: {
        limit?: number;
        search?: (string | null);
        skip?: number;
        sort_by?: SortBy;
        sort_order?: SortOrder;
    };
};

export type CategoryGetAllCategoriesResponse = (Array<CategoryResponse>);

export type CategoryGetAllCategoriesError = (HTTPValidationError);

export type ProductGetAllProductsData = {
    query?: {
        brand?: (string | null);
        category?: (string | null);
        page?: number;
        search?: (string | null);
        size?: (number | null);
        sort_by?: SortByProduct;
        sort_order?: SortOrder;
    };
};

export type ProductGetAllProductsResponse = (Array<ProductResponse>);

export type ProductGetAllProductsError = (HTTPValidationError);

export type ProductGetProductByIdRouteData = {
    path: {
        product_id: string;
    };
};

export type ProductGetProductByIdRouteResponse = (ProductResponse);

export type ProductGetProductByIdRouteError = (HTTPValidationError);

export type CartGetCartRouteData = {
    query?: {
        page?: number;
        search?: (string | null);
    };
};

export type CartGetCartRouteResponse = (CartResponse);

export type CartGetCartRouteError = (HTTPValidationError);

export type CartAddToCartRouteData = {
    body: AddToCartRequest;
};

export type CartAddToCartRouteResponse = (CartItemResponse);

export type CartAddToCartRouteError = (HTTPValidationError);

export type CartChangeItemQuantityRouteData = {
    path: {
        cart_id: string;
    };
};

export type CartChangeItemQuantityRouteResponse = (CartItemResponse);

export type CartChangeItemQuantityRouteError = (HTTPValidationError);

export type CartRemoveItemCartRouteData = {
    body: ChangeItemQtyRequest;
    path: {
        cart_id: string;
    };
};

export type CartRemoveItemCartRouteResponse = (CartItemResponse);

export type CartRemoveItemCartRouteError = (HTTPValidationError);

export type AdminAdminGetResponse = (unknown);

export type AdminAdminGetError = unknown;

export type AdminCreateNewAdminData = {
    body: AdminCreateRequest;
};

export type AdminCreateNewAdminResponse = (AdminResponse);

export type AdminCreateNewAdminError = (HTTPValidationError);

export type AdminAdminLoginData = {
    body: Body_admin_admin_login;
};

export type AdminAdminLoginResponse = (Token);

export type AdminAdminLoginError = (HTTPValidationError);

export type AdminAdminLogoutResponse = (unknown);

export type AdminAdminLogoutError = unknown;

export type AdminAdminLogoutAllResponse = (unknown);

export type AdminAdminLogoutAllError = unknown;

export type AdminProtectedResponse = (unknown);

export type AdminProtectedError = unknown;

export type AdminAdminRefreshTokenRouteResponse = (Token);

export type AdminAdminRefreshTokenRouteError = unknown;

export type AdminGetAdminProfileDetailsResponse = (AdminResponse);

export type AdminGetAdminProfileDetailsError = unknown;

export type AdminUpdateAdminProfileDetailsData = {
    body: Body_admin_update_admin_profile_details;
};

export type AdminUpdateAdminProfileDetailsResponse = (AdminResponse);

export type AdminUpdateAdminProfileDetailsError = (HTTPValidationError);

export type AdminUpdateAdminRoleRouteData = {
    body: AdminRoleUpdateRequest;
};

export type AdminUpdateAdminRoleRouteResponse = (AdminResponse);

export type AdminUpdateAdminRoleRouteError = (HTTPValidationError);

export type AdminUpdateAdminProfileImageRouteData = {
    body: Body_admin_update_admin_profile_image_route;
};

export type AdminUpdateAdminProfileImageRouteResponse = (AdminResponse);

export type AdminUpdateAdminProfileImageRouteError = (HTTPValidationError);

export type AdminGetAllBrandsData = {
    query?: {
        limit?: number;
        search?: (string | null);
        skip?: number;
        sort_by?: SortBy;
        sort_order?: SortOrder;
    };
};

export type AdminGetAllBrandsResponse = (Array<BrandResponse>);

export type AdminGetAllBrandsError = (HTTPValidationError);

export type AdminBrandCreateData = {
    body: BrandCreateRequest;
};

export type AdminBrandCreateResponse = (BrandResponse);

export type AdminBrandCreateError = (HTTPValidationError);

export type AdminBrandUpdateData = {
    body: BrandCreateRequest;
    path: {
        brand_id: string;
    };
};

export type AdminBrandUpdateResponse = (BrandResponse);

export type AdminBrandUpdateError = (HTTPValidationError);

export type AdminBrandDeleteData = {
    path: {
        brand_id: string;
    };
};

export type AdminBrandDeleteResponse = (unknown);

export type AdminBrandDeleteError = (HTTPValidationError);

export type AdminGetAllCategoriesData = {
    query?: {
        limit?: number;
        search?: (string | null);
        skip?: number;
        sort_by?: SortBy;
        sort_order?: SortOrder;
    };
};

export type AdminGetAllCategoriesResponse = (Array<CategoryResponse>);

export type AdminGetAllCategoriesError = (HTTPValidationError);

export type AdminCategoryCreateData = {
    body: CategoryCreateRequest;
};

export type AdminCategoryCreateResponse = (CategoryResponse);

export type AdminCategoryCreateError = (HTTPValidationError);

export type AdminCategoryUpdateData = {
    body: CategoryCreateRequest;
    path: {
        category_id: string;
    };
};

export type AdminCategoryUpdateResponse = (CategoryResponse);

export type AdminCategoryUpdateError = (HTTPValidationError);

export type AdminCategoryDeleteData = {
    path: {
        category_id: string;
    };
};

export type AdminCategoryDeleteResponse = (SuccessMessage);

export type AdminCategoryDeleteError = (HTTPValidationError);

export type AdminGetAdminsData = {
    query?: {
        limit?: number;
        role?: (AdminRole | null);
        search?: (string | null);
        skip?: number;
        sort_by?: SortByAdmin;
        sort_order?: SortOrder;
    };
};

export type AdminGetAdminsResponse = (Array<AdminResponse>);

export type AdminGetAdminsError = (HTTPValidationError);

export type AdminGetAdminData = {
    path: {
        admin_id: string;
    };
};

export type AdminGetAdminResponse = (AdminResponse);

export type AdminGetAdminError = (HTTPValidationError);

export type AdminAdminDeleteData = {
    path: {
        admin_id: string;
    };
};

export type AdminAdminDeleteResponse = (SuccessMessage);

export type AdminAdminDeleteError = (HTTPValidationError);

export type AdminUpdateOtherAdminRoleData = {
    body: AdminRoleUpdateRequest;
    path: {
        admin_id: string;
    };
};

export type AdminUpdateOtherAdminRoleResponse = (AdminResponse);

export type AdminUpdateOtherAdminRoleError = (HTTPValidationError);

export type AdminGetAllProductsAdminData = {
    query?: {
        brand?: (string | null);
        category?: (string | null);
        page?: number;
        search?: (string | null);
        size?: (number | null);
        sort_by?: SortByProduct;
        sort_order?: SortOrder;
    };
};

export type AdminGetAllProductsAdminResponse = (Array<ProductResponse>);

export type AdminGetAllProductsAdminError = (HTTPValidationError);

export type AdminProductCreateData = {
    body: ProductCreateRequest;
};

export type AdminProductCreateResponse = (ProductResponse);

export type AdminProductCreateError = (HTTPValidationError);

export type AdminDeleteMultipleProductsData = {
    body: DeleteProductsRequests;
};

export type AdminDeleteMultipleProductsResponse = (Array<ProductResponse>);

export type AdminDeleteMultipleProductsError = (HTTPValidationError);

export type AdminProductByIdData = {
    path: {
        product_id: string;
    };
};

export type AdminProductByIdResponse = (ProductResponse);

export type AdminProductByIdError = (HTTPValidationError);

export type AdminProdcutDetailsUpdateData = {
    body: ProductDetailsRequest;
    path: {
        product_id: string;
    };
};

export type AdminProdcutDetailsUpdateResponse = (ProductResponse);

export type AdminProdcutDetailsUpdateError = (HTTPValidationError);

export type AdminDeleteProductData = {
    path: {
        product_id: string;
    };
};

export type AdminDeleteProductResponse = (ProductResponse);

export type AdminDeleteProductError = (HTTPValidationError);

export type AdminProductSizeStockUpdateData = {
    body: ProductSizeStockRequest;
    path: {
        product_id: string;
    };
};

export type AdminProductSizeStockUpdateResponse = (ProductResponse);

export type AdminProductSizeStockUpdateError = (HTTPValidationError);

export type AdminAddImagesData = {
    body: Body_admin_add_images;
    path: {
        product_id: string;
    };
};

export type AdminAddImagesResponse = (ProductResponse);

export type AdminAddImagesError = (HTTPValidationError);

export type AdminDeleteImagesData = {
    body: DeleteImagesRequest;
    path: {
        product_id: string;
    };
};

export type AdminDeleteImagesResponse = (ProductResponse);

export type AdminDeleteImagesError = (HTTPValidationError);

export type ServeAdminReactAppData = {
    path: {
        full_path: string;
    };
};

export type ServeAdminReactAppResponse = (string);

export type ServeAdminReactAppError = (HTTPValidationError);

export type ServeReactAppData = {
    path: {
        full_path: string;
    };
};

export type ServeReactAppResponse = (string);

export type ServeReactAppError = (HTTPValidationError);