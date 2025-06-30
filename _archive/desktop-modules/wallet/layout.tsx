"use client"

import type React from "react"

import { Toaster } from "react-hot-toast"

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" />
    </>
  )
}

