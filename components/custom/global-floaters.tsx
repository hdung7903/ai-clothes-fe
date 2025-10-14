"use client"

import { usePathname } from "next/navigation"

import ChatDialog from "@/components/custom/chatDialog"
import ScrollUp from "@/components/custom/scrollUp"

function isUnder(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(base + "/")
}

export default function GlobalFloaters() {
  const pathname = usePathname() || "/"

  const hideScrollUp = isUnder(pathname, "/auth") || pathname === "/design"
  const hideChat =
    isUnder(pathname, "/auth") || isUnder(pathname, "/admin") || pathname === "/design"

  // keep ScrollUp next to Chat button (space them horizontally)
  const scrollUpPos = "fixed bottom-6 right-[5.5rem]" // ~ gap-4 from chat button

  return (
    <>
      {!hideScrollUp && <ScrollUp positionClass={scrollUpPos} />}
      {!hideChat && <ChatDialog />}
    </>
  )
}


