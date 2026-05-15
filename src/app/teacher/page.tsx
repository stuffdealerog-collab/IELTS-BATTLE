'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTMA } from '@/components/tma/TMAProvider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/tma/BackButton'
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Plus,
  Users,
  Loader2,
  School,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

interface ClassroomItem {
  id: string
  name: string
  code: string
  description: string | null
  createdAt: string
  _count: { members: number }
}

export default function TeacherPage() {
  const { user, isLoading } = useTMA()
  const router = useRouter()
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const loadClassrooms = async () => {
    const res = await fetch('/api/teacher/classroom')
    if (res.ok) {
      const d = await res.json()
      setClassrooms(d.classrooms ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!isLoading && user) loadClassrooms()
  }, [isLoading, user])

  if (!isLoading && user?.role !== 'TEACHER') {
    router.replace('/teacher/register')
    return null
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/teacher/classroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() || undefined }),
      })
      if (!res.ok) throw new Error()
      const { classroom } = await res.json()
      setClassrooms((prev) => [classroom, ...prev])
      setShowCreate(false)
      setNewName('')
      setNewDesc('')
      toast.success('Classroom created!')
    } catch {
      toast.error('Failed to create classroom')
    } finally {
      setCreating(false)
    }
  }

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code).catch(() => {})
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const displayName = user?.firstName ?? user?.username ?? 'Teacher'

  return (
    <div className="min-h-[var(--tg-stable-h,100vh)]">
      <BackButton fallbackPath="/" />
      <div className="mx-auto w-full max-w-2xl px-4 tma-safe-top pb-10 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 pt-1">
          <Link href="/" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 active:scale-95 transition-transform">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold flex items-center gap-1.5">
              <School className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              Teacher Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">Welcome, {displayName}</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-4 text-white elev-2">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-yellow-200" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-base leading-tight">My Classrooms</h2>
              <p className="text-[11px] text-white/85 leading-snug mt-0.5">
                {classrooms.length} {classrooms.length === 1 ? 'class' : 'classes'} · Monitor essays, AI flags & progress
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold leading-none">
                {classrooms.reduce((a, c) => a + c._count.members, 0)}
              </p>
              <p className="text-[10px] text-white/80 mt-0.5">Students</p>
            </div>
          </div>
        </div>

        {/* Create classroom form */}
        {showCreate ? (
          <div className="rounded-2xl bg-card p-4 elev-1 space-y-3">
            <h3 className="font-semibold text-sm">New Classroom</h3>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Classroom name (e.g. IELTS Prep 2025)"
              className="w-full rounded-xl border px-3 py-2.5 text-sm bg-secondary/50 focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full rounded-xl border px-3 py-2 text-sm bg-secondary/50 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 rounded-xl" onClick={handleCreate} disabled={creating || !newName.trim()}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </Button>
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button className="w-full gap-2 h-11 rounded-xl" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" />
            New Classroom
          </Button>
        )}

        {/* Classrooms list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <School className="w-12 h-12 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No classrooms yet.</p>
            <p className="text-xs text-muted-foreground">Create one and share the join code with your students.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {classrooms.map((c) => (
              <div key={c.id} className="rounded-2xl bg-card elev-1 overflow-hidden">
                <Link href={`/teacher/class/${c.id}`} className="block">
                  <div className="p-3.5 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[14px] leading-tight truncate">{c.name}</h3>
                      {c.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c._count.members} {c._count.members === 1 ? 'student' : 'students'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
                <div className="border-t px-3.5 py-2 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Join code</span>
                    <Badge variant="secondary" className="font-mono text-xs tracking-widest px-2">{c.code}</Badge>
                  </div>
                  <button
                    onClick={() => copyCode(c.code)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    aria-label="Copy code"
                  >
                    {copiedCode === c.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
