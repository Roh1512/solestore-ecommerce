import {
  UpdateContactInfoRequest,
  UpdateProfileRequest,
  UserResponse,
} from "@/client";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const userProfileApiSlice = createApi({
  reducerPath: "userProfileApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getProfile: builder.query<UserResponse, void>({
      query: () => ({
        url: "/profile/",
        method: "GET",
      }),
      providesTags: [{ type: "Profile" }],
    }),
    updateProfileDetails: builder.mutation<
      UserResponse,
      { profileDetails: UpdateProfileRequest; currentPassword: string }
    >({
      query: ({ profileDetails, currentPassword }) => ({
        url: "/profile/",
        method: "PUT",
        body: {
          profile_details: profileDetails,
          current_password: currentPassword,
        },
      }),
      invalidatesTags: [{ type: "Profile" }],
    }),
    updateContactInfo: builder.mutation<
      UserResponse,
      { contactInfo: UpdateContactInfoRequest; currentPassword: string }
    >({
      query: ({ contactInfo, currentPassword }) => ({
        url: "/profile/update-contact-info",
        method: "PUT",
        body: {
          contact_info: contactInfo,
          current_password: currentPassword,
        },
      }),
      invalidatesTags: [{ type: "Profile" }],
    }),
    updateProfileImage: builder.mutation<UserResponse, FormData>({
      query: (formData) => ({
        url: "/profile/update-profile-img",
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
  useUpdateContactInfoMutation,
} = userProfileApiSlice;
