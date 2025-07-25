"use client"

import { type LucideIcon } from "lucide-react"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavLink } from "react-router"
import { useEffect, useState } from "react"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        isIndex?: boolean
        icon?: LucideIcon
    }[]
}) {
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => {
                        const [isActive, setIsActive] = useState(false)

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton tooltip={item.title} isActive={isActive} asChild>
                                    <NavLink to={item.url} end={item.isIndex}>
                                        {({ isActive }) => {
                                            useEffect(() => setIsActive(isActive), [isActive])
                                            return (
                                                <>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span></>
                                            )
                                        }}
                                    </NavLink>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
