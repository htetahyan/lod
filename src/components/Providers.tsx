'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
} 