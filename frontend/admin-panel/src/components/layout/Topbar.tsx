"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Topbar() {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-white px-6 shadow-sm z-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <div className="hidden md:flex relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search anywhere..."
            className="w-full bg-slate-50 pl-9 border-slate-200 focus-visible:ring-blue-500 rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-4 w-4 text-slate-600" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-8 w-8 items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-slate-400">
            <Avatar className="h-8 w-8 border border-slate-200 cursor-pointer">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">AD</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-slate-500">
                  admin@meenavan.lk
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
