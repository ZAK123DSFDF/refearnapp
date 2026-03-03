// components/ui-custom/SidebarHelp.tsx
"use client"

import React from "react"
import { MailQuestion, ExternalLink } from "lucide-react"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface SidebarHelpProps {
  showLabel?: boolean
}

export const SidebarHelp = ({ showLabel = true }: SidebarHelpProps) => {
  const DOCS_URL = "https://refearnapp.com/docs"

  return (
    <SidebarGroup className="p-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            tooltip="Documentation & Help"
            className="hover:bg-primary/5 transition-colors group"
          >
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-muted-foreground hover:text-primary"
            >
              <MailQuestion className="w-5 h-5 shrink-0" />
              {showLabel && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">Help & Docs</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
              )}
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
