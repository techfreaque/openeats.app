import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "next-vibe/client/components/ui/use-toast";
import { useApiMutation, useApiQuery } from "next-vibe/client/hooks/api";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import resetPasswordEndpoints from "./definition";
import type {
  ResetPasswordConfirmType,
  ResetPasswordRequestType,
} from "./schema";

/**
 * Hook for requesting a password reset
 * @returns Form and mutation for requesting a password reset
 */
export const useResetPasswordRequest = () => {
  const { toast } = useToast();
  const router = useRouter();

  // Create form for password reset request
  const form = useForm<ResetPasswordRequestType>({
    resolver: zodResolver(resetPasswordEndpoints.POST.requestSchema),
    defaultValues: {
      email: "",
    },
  });

  // Create mutation for password reset request
  const resetPasswordMutation = useApiMutation({
    endpoint: resetPasswordEndpoints.POST,
  });

  // Handle form submission
  const onSubmit = useCallback(
    async (data: ResetPasswordRequestType) => {
      try {
        const result = await resetPasswordMutation.mutateAsync(data);
        toast({
          title: "Password Reset Email Sent",
          description: result,
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
export const useResetPasswordConfirm = (token: string, email: string) => {
  const { toast } = useToast();
  const router = useRouter();

  // Create form for password reset confirmation
  const form = useForm<ResetPasswordConfirmType>({
    resolver: zodResolver(resetPasswordEndpoints.PUT.requestSchema),
    defaultValues: {
      email,
      token,
      password: "",
      confirmPassword: "",
    },
  });

  // Create mutation for password reset confirmation
  const resetPasswordConfirmMutation = useApiMutation({
    endpoint: resetPasswordEndpoints.PUT,
  });

  // Handle form submission
  const onSubmit = useCallback(
    async (data: ResetPasswordConfirmType) => {
      try {
        const result = await resetPasswordConfirmMutation.mutateAsync(data);
        toast({
          title: "Password Reset Successful",
          description: result,
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
export const useResetPasswordValidate = (token: string) => {
  return useApiQuery({
    endpoint: resetPasswordEndpoints.GET,
    params: { token },
    enabled: !!token,
  });
};
