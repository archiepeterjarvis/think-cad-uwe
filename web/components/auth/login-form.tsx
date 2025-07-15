"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Chrome, Github, Loader2, Mail, Sparkles, Zap } from "lucide-react";
import { signIn } from "next-auth/react";

const oauthProviders = [
  {
    name: "Google",
    icon: Chrome,
    color: "hover:bg-purple-800",
    textColor: "text-white",
  },
  {
    name: "GitHub",
    icon: Github,
    color: "hover:bg-purple-800",
    textColor: "text-white",
  },
];

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    await signIn("resend", {
      email: email,
      redirectTo: "/chat",
    }); // todo: fix
  };

  const handleOAuthLogin = async (provider: string) => {
    setLoadingProvider(provider);

    await signIn(provider.toLowerCase(), {
      redirectTo: "/chat",
    });
  };

  if (magicLinkSent) {
    return (
      <Card className="w-full max-w-md gradient-border bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We've sent a magic link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Magic link sent!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click the link in your email to sign in instantly. The link
                  will expire in 15 minutes.
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setMagicLinkSent(false)}
          >
            Try a different email
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Didn't receive the email? Check your spam folder or try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md gradient-border bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm mb-4 mx-auto">
          <Sparkles className="mr-2 h-4 w-4 text-primary animate-pulse" />
          <span>Welcome to TextCAD</span>
        </div>
        <CardTitle className="text-2xl font-bold">
          Sign in to your <span className="text-gradient">account</span>
        </CardTitle>
        <CardDescription>
          Choose your preferred sign-in method to start creating CAD models
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* OAuth Providers */}
        <div className="space-y-3">
          {oauthProviders.map((provider) => (
            <Button
              key={provider.name}
              variant="outline"
              className={`w-full h-12 relative overflow-hidden group font-medium ${provider.color} hover:${provider.textColor} transition-colors`}
              onClick={() => handleOAuthLogin(provider.name)}
              disabled={loadingProvider !== null}
            >
              <div
                className={`absolute inset-0 ${provider.color} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
              <div className="relative flex items-center justify-center space-x-3">
                {loadingProvider === provider.name ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <provider.icon className="h-5 w-5" />
                )}
                <span>Continue with {provider.name}</span>
              </div>
            </Button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Magic Link Form */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-primary/20 focus:border-primary/40"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-purple hover:opacity-90 transition-opacity"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending magic link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send magic link
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
