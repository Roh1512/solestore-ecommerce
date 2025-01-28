import { createApi } from "@reduxjs/toolkit/query/react";
import { AdminResponse, AdminUpdateRequest } from "@/client";
import { baseQueryWithReauth } from "./beseQuery";

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query<AdminResponse, void>({
      query: () => ({
        url: "/profile/",
        method: "GET",
        credentials: "include",
      }),
      providesTags: [{ type: "Profile" }],
    }),
    updateProfile: builder.mutation<
      AdminResponse,
      { profileDetails: AdminUpdateRequest; currentPassword: string }
    >({
      query: ({ profileDetails, currentPassword }) => ({
        url: "/profile/",
        method: "PUT",
        body: {
          profile_details: profileDetails,
          current_password: currentPassword,
        },
        credentials: "include",
      }),
      // Optional: Cache invalidation and updating state after mutation
      invalidatesTags: [{ type: "Profile" }],
    }),
    updateProfileImage: builder.mutation<AdminResponse, FormData>({
      query: (formData) => ({
        url: "/profile/update-profile-img",
        method: "POST",
        body: formData,
        credentials: "include",
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
