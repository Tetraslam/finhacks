"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { Toaster } from "@/components/ui/toaster"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold sm:inline-block">
                &nbsp;&nbsp;&nbsp;&nbsp;ProsperouSSS
              </span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
} 