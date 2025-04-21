import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { ApiEndpoint } from "next-vibe/client/endpoint";
import { useApiMutation } from "next-vibe/client/hooks/mutation";
import { useApiQuery } from "next-vibe/client/hooks/query";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { useToast } from "@/packages/next-vibe-ui/web/ui/use-toast";

import resetPasswordEndpoints from "./definition";
import {
  resetPasswordConfirmSchema,
  type ResetPasswordConfirmType,
  resetPasswordRequestSchema,
  type ResetPasswordRequestType,
  type ResetPasswordValidateType,
} from "./schema";

/**
 * Hook for requesting a password reset
 * @returns Form and mutation for requesting a password reset
 */
export const useResetPasswordRequest = (): {
  form: ReturnType<typeof useForm<ResetPasswordRequestType>>;
  onSubmit: (data: ResetPasswordRequestType) => Promise<void>;
  isLoading: boolean;
} => {
  const { toast } = useToast();
  const router = useRouter();

  // Create form for password reset request
  const form = useForm<ResetPasswordRequestType>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  // Create mutation for password reset request
  const resetPasswordMutation = useApiMutation(
    resetPasswordEndpoints.POST as unknown as ApiEndpoint<
      ResetPasswordRequestType,
      string,
      undefined,
      string
    >,
    {},
  );

  // Handle form submission
  const onSubmit = useCallback(
    async (data: ResetPasswordRequestType): Promise<void> => {
      try {
        const result = await resetPasswordMutation.mutateAsync({
          requestData: data,
          urlParams: undefined,
        });

        toast({
          title: "Password Reset Email Sent",
          description:
            typeof result === "string" ? result : "Password reset email sent!",
          variant: "default",
        });

        // Redirect to login page
        router.push("/login");
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to send password reset email",
          variant: "destructive",
        });
      }
    },
    [resetPasswordMutation, toast, router],
  );

  return {
    form,
    onSubmit,
    isLoading: resetPasswordMutation.isPending,
  };
};

/**
 * Hook for confirming a password reset
 * @param token - The password reset token
 * @param email - The user's email
 * @returns Form and mutation for confirming a password reset
 */
export const useResetPasswordConfirm = (
  token: string,
  email: string,
): {
  form: ReturnType<typeof useForm<ResetPasswordConfirmType>>;
  onSubmit: (data: ResetPasswordConfirmType) => Promise<void>;
  isLoading: boolean;
} => {
  const { toast } = useToast();
  const router = useRouter();

  // Create form for password reset confirmation
  const form = useForm<ResetPasswordConfirmType>({
    resolver: zodResolver(resetPasswordConfirmSchema),
    defaultValues: {
      email,
      token,
      password: "",
      confirmPassword: "",
    },
  });

  // Create mutation for password reset confirmation
  const resetPasswordConfirmMutation = useApiMutation(
    resetPasswordEndpoints.PUT as unknown as ApiEndpoint<
      ResetPasswordConfirmType,
      string,
      undefined,
      string
    >,
    {},
  );

  // Handle form submission
  const onSubmit = useCallback(
    async (data: ResetPasswordConfirmType): Promise<void> => {
      try {
        const result = await resetPasswordConfirmMutation.mutateAsync({
          requestData: data,
          urlParams: undefined,
        });

        toast({
          title: "Password Reset Successful",
          description:
            typeof result === "string" ? result : "Password reset successful!",
          variant: "default",
        });

        // Redirect to login page
        router.push("/login");
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to reset password",
          variant: "destructive",
        });
      }
    },
    [resetPasswordConfirmMutation, toast, router],
  );

  return {
    form,
    onSubmit,
    isLoading: resetPasswordConfirmMutation.isPending,
  };
};

/**
 * Hook for validating a password reset token
 * @param token - The password reset token
 * @returns Query for validating a password reset token
 */
export const useResetPasswordValidate = (
  token: string,
): ReturnType<typeof useApiQuery> => {
  return useApiQuery(
    resetPasswordEndpoints.GET as unknown as ApiEndpoint<
      ResetPasswordValidateType,
      string,
      undefined,
      string
    >,
    { token },
    undefined,
    {
      enabled: !!token,
      staleTime: 0,
    },
  );
};
