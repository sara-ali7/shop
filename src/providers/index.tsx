"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./auth-provider";
import { CartProvider } from "./cart-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
