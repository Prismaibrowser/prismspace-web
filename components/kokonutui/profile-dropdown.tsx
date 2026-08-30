"use client";

import * as React from "react";
import { ChevronDown, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ProfileDropdownData {
  name: string;
  avatar: string;
}

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ProfileDropdownData;
  onSettingsClick?: () => void;
}

function isImageAvatar(avatar: string) {
  return (
    avatar.startsWith("data:image/") ||
    avatar.startsWith("/") ||
    avatar.startsWith("http://") ||
    avatar.startsWith("https://")
  );
}

function Avatar({ avatar, name }: ProfileDropdownData) {
  return (
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 text-lg">
      {isImageAvatar(avatar) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{avatar}</span>
      )}
    </span>
  );
}

export default function ProfileDropdown({
  data,
  onSettingsClick,
  className,
  ...props
}: ProfileDropdownProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex h-12 min-w-0 items-center gap-3 rounded-xl border border-white/20 bg-black/70 px-2.5 pr-3 text-white shadow-sm transition-all duration-200 hover:border-white/30 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
              title="Profile"
            />
          }
        >
          <Avatar avatar={data.avatar} name={data.name} />
          <span className="hidden max-w-32 truncate text-sm font-semibold leading-none sm:block">
            {data.name}
          </span>
          <ChevronDown className="hidden h-4 w-4 text-white/55 sm:block" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="top"
          sideOffset={10}
          className="w-60 rounded-xl border border-white/15 bg-zinc-950/95 p-2 text-white shadow-xl shadow-black/30 backdrop-blur-md"
        >
          <div className="flex items-center gap-3 px-2 py-2.5">
            <Avatar avatar={data.avatar} name={data.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-white">
                {data.name}
              </p>
              <p className="text-xs leading-tight text-white/45">Dashboard profile</p>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1 bg-white/10" />

          <DropdownMenuItem
            nativeButton
            render={
              <button
                type="button"
                onClick={onSettingsClick}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
              />
            }
          >
            <Settings className="h-4 w-4 text-white/60" />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            nativeButton
            render={
              <button
                type="button"
                onClick={onSettingsClick}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
              />
            }
          >
            <User className="h-4 w-4 text-white/50" />
            <span>Edit profile</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
