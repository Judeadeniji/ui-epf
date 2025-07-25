"use client"

import {
  LayoutDashboardIcon,
  ListIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { NavUser } from "./nav-user"
import { NavMain } from "./nav-main"
import { useSession } from "@/contexts/session"

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
  navAdmin: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      isIndex: true
    },    {
      title: "Users",
      url: "/dashboard/officers",
      icon: UsersIcon,
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
  const { user } = useSession()

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
        <NavMain items={user.role === "admin" ? data.navAdmin : data.navMain} />
      </SidebarContent>

      <SidebarFooter>
          <NavUser user={{
            name: user.name,
            email: user.email,
            avatar: user.image || "",
          }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
