import { RootState } from "@/app/store";
import { UpdateProfileRequest, UserResponse } from "@/client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userProfileApiSlice = createApi({
  reducerPath: "userProfileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/profile",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        console.warn("No token found!"); // Add a warning if no token is available
      }
      return headers;
    },
  }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query<UserResponse, void>({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: [{ type: "Profile" }],
    }),
    updateProfileDetails: builder.mutation<
      UserResponse,
      { profileDetails: UpdateProfileRequest; currentPassword: string }
    >({
      query: ({ profileDetails, currentPassword }) => ({
        url: "/",
        method: "PUT",
        body: {
          profile_details: profileDetails,
          current_password: currentPassword,
        },
      }),
      invalidatesTags: [{ type: "Profile" }],
    }),
    updateProfileImage: builder.mutation<UserResponse, FormData>({
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
  useUpdateProfileImageMutation,
  useUpdateProfileDetailsMutation,
} = userProfileApiSlice;
