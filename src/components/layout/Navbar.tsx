'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BookOpen, LayoutDashboard, LogOut, User } from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <nav className="h-16 border-b bg-white sticky top-0 z-40 px-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-800">
        <BookOpen className="w-5 h-5 text-blue-600" />
        IELTS Battle
      </Link>

      <div className="flex items-center gap-2">
        <Link href="/practice">
          <Button variant="ghost" size="sm" className="gap-1.5 hidden sm:flex">
            <BookOpen className="w-4 h-4" />
            Practice
          </Button>
        </Link>

        {session ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 hidden sm:flex">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-8 h-8 cursor-pointer">
                  <AvatarImage src={session.user?.image ?? undefined} />
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-3 py-2">
                  <p className="font-medium text-sm">{session.user?.name}</p>
                  <p className="text-xs text-slate-500">{session.user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
