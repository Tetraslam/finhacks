"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { Toaster } from "@/components/ui/toaster"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-body">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-display text-lg font-bold tracking-tight">
                <span className="text-accent">🐍 Pro</span>
                <span className="text-secondary">$</span>
                <span className="text-accent">perou</span>
                <span className="text-secondary">$$$</span>
              </span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="h-4 w-full rounded-sm bg-muted/30 md:w-[100px]" />
            </div>
            <nav className="flex items-center space-x-2">
              <ModeToggle />
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container max-w-screen-2xl py-6">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
} 