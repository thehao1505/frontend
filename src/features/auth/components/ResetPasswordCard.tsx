/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axios";
import { config } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { setCookie } from "nookies";
import { useState } from "react";

export const ResetPasswordCard = () => {
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const params = useParams();
  const rToken = params.token as string;

  const onResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.patch(
        `${config.url}/api/v1/auth/resset-password/${rToken}`,
        {
          password,
          passwordConfirm,
        }
      );

      if (response.status === 200) {
        const token = response.data.token.accessToken;
        setCookie(null, "token", token, { path: "/" });
      }

      if (response.status === 403) {
        setError(response.data.message);
      }

      router.push("/");
    } catch (error: any) {
      setError(error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card className="w-full h-full p-8">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Reset password </CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        {!!error && (
          <div
            className="bg-destructive/15 p-3 rounded-md flex items-center
          gap-x-2 text-sm text-destructive mb-6"
          >
            <TriangleAlert className="size-4" />
            <p>Can not reset password. Please try again.</p>
          </div>
        )}
        <CardContent className="space-y-5 px-0 pb-0">
          <form onSubmit={onResetPassword} className="space-y-2">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              required
            />
            <Input
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm Password"
              type="password"
              required
            />
            <Button
              disabled={isLoading}
              type="submit"
              size="lg"
              className="bg-neutral-950 w-full"
            >
              Continue
            </Button>
          </form>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Already have an account?
            <Link href="/login">
              <span className="text-sky-700 hover:underline"> Login</span>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
