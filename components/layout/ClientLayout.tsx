'use client';

import { ThemeProvider } from "@/lib/theme-context";
import { Header } from "./Header";
import { ReactNode } from "react";

interface ClientLayoutProps {
    children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
    return (
        <ThemeProvider defaultTheme="light">
            <Header />
            {children}
        </ThemeProvider>
    );
}
