"use client"

import {
  LayoutDashboardIcon,
  ListIcon,
  SettingsIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { NavUser } from "./nav-user"
import { NavMain } from "./nav-main"
import { useSession } from "@/lib/auth-client"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      isIndex: true
    },
    {
      title: "Applications",
      url: "/dashboard/applications",
      icon: ListIcon,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: SettingsIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex gap-x-2 items-center">
            <Image src={"/UI_Logo.png"} alt="logo" width={50} height={50} priority />
            <span className="text-lg font-bold font-mono leading-snug">University of Ibadan</span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        {session && (
          <NavUser user={{
            name: session.user.name,
            email: session.user.email,
            avatar: session.user.image || "",
          }} />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
