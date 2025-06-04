/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { isEmail, config } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { setCookie } from "nookies";
import { useState } from "react";
import Link from "next/link";

interface LoginData {
  emailOrUsername: string;
  password: string;
}

export const LoginCard = () => {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginData, setLoginData] = useState<LoginData>({
    emailOrUsername: "",
    password: "",
  });

  const router = useRouter();

  const onCredentialsSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const payload = isEmail(loginData.emailOrUsername)
        ? { email: loginData.emailOrUsername, password: loginData.password }
        : { username: loginData.emailOrUsername, password: loginData.password };

      const response = await axiosInstance.post(`${config.url}/api/v1/auth/login`, payload);

      if (response.status === 201) {
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
          <CardTitle>Login to Continue</CardTitle>
          <CardDescription>Use your email or another service to continue</CardDescription>
        </CardHeader>
        {!!error && (
          <div
            className="bg-destructive/15 p-3 rounded-md flex items-center
          gap-x-2 text-sm text-destructive mb-6"
          >
            <TriangleAlert className="size-4" />
            <p>Invalid email or password</p>
          </div>
        )}
        <CardContent className="space-y-5 px-0 pb-0">
          <form onSubmit={onCredentialsSignIn} className="space-y-2 5">
            <Input
              value={loginData.emailOrUsername}
              onChange={(e) => setLoginData({ ...loginData, emailOrUsername: e.target.value })}
              placeholder="Email or Username"
              type="text"
              required
            />
            <Input
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              placeholder="Password"
              type="password"
              required
            />
            <Button disabled={isLoading} type="submit" size="lg" className="bg-neutral-950 w-full">
              Continue
            </Button>
          </form>
          <Separator />
          <p className="text-xs text-muted-foreground mb-2">
            <Link href="/forgot-password">
              <span className="text-sky-700 hover:underline">Forgot password?</span>
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?
            <Link href="/sign-up">
              <span className="text-sky-700 hover:underline"> Sign up</span>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
