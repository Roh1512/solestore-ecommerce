import { RootState } from "@/app/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AdminResponse, AdminUpdateRequest } from "@/client";

export const profileApi = createApi({
  reducerPath: "createApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin/profile",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        console.warn("No token found");
        headers.set("Authorization", "Bearer");
      }
      return headers;
    },
  }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query<AdminResponse, void>({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: [{ type: "Profile" }],
    }),
    updateProfile: builder.mutation<
      AdminResponse,
      { profileDetails: AdminUpdateRequest; currentPassword: string }
    >({
      query: ({ profileDetails, currentPassword }) => ({
        url: "/",
        method: "PUT",
        body: {
          profile_details: profileDetails,
          current_password: currentPassword,
        },
      }),
      // Optional: Cache invalidation and updating state after mutation
      invalidatesTags: [{ type: "Profile" }],
    }),
    updateProfileImage: builder.mutation<AdminResponse, FormData>({
      query: (formData) => ({
        url: "/update-profile-img",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Profile" }],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateProfileImageMutation,
} = profileApi;
