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
import { CircleCheck, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const ForgotPasswordCard = () => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const onForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        `${config.url}/api/v1/auth/forgot-password`,
        {
          email,
        }
      );

      if (response.status === 201) {
        setSuccess(true);
      }

      if (response.status === 403) {
        setError(response.data.message);
      }
    } catch (error: any) {
      setError(error.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!!success ? (
        <div>
          <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-x-2">
                Success
                <CircleCheck className="size-5 text-green-600" />
              </CardTitle>
              <CardDescription>
                A link to reset your password has been sent to your email.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div>
          <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Forgot your password?</CardTitle>
              <CardDescription>
                Enter your email to reset your password
              </CardDescription>
            </CardHeader>
            {!!error && (
              <div
                className="bg-destructive/15 p-3 rounded-md flex items-center
              gap-x-2 text-sm text-destructive mb-6"
              >
                <TriangleAlert className="size-4" />
                <p>Invalid email</p>
              </div>
            )}
            <CardContent className="space-y-5 px-0 pb-0">
              <form onSubmit={onForgotPassword} className="space-y-2">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
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
                Don&apos;t have an account?
                <Link href="/login">
                  <span className="text-sky-700 hover:underline"> Login</span>
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
