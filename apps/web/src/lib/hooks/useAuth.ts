"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  deleteCurrentUser,
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  oauthLogin,
  registerUser,
  resendVerification,
  resetPassword,
  updateCurrentUser,
  updateMyRole,
  verifyEmail,
} from "@web/lib/api/auth";
import { completeOnboarding } from "@web/lib/api/users";
import {
  fetchVerificationStatus,
  submitVerificationDocument,
} from "@web/lib/api/verification";
import type { VerificationStatusResponse } from "@web/lib/api/types";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRegisterUser() {
  return useMutation({
    mutationFn: registerUser,
  });
}

export function useLoginUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useOauthLogin() {
  return useMutation({
    mutationFn: oauthLogin,
  });
}

export function useLogoutUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changePassword(currentPassword, newPassword),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => resetPassword(token, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useResendVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resendVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useUpdateMyRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (role: Parameters<typeof updateMyRole>[0]) => updateMyRole(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useDeleteCurrentUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCurrentUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof completeOnboarding>[0]) =>
      completeOnboarding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useVerificationStatus() {
  const { data: user } = useCurrentUser();
  return useQuery<VerificationStatusResponse>({
    queryKey: ["verification-status"],
    queryFn: fetchVerificationStatus,
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => submitVerificationDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verification-status"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}
