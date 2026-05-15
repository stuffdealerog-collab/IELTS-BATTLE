import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  if (!code?.trim()) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  const classroom = await prisma.classroom.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { teacher: { select: { firstName: true, username: true } } },
  })

  if (!classroom) return NextResponse.json({ error: 'Invalid classroom code' }, { status: 404 })

  // Check already a member
  const existing = await prisma.classroomMember.findUnique({
    where: { classroomId_userId: { classroomId: classroom.id, userId: session.userId } },
  })

  if (existing) {
    return NextResponse.json({
      classroom: { id: classroom.id, name: classroom.name, alreadyMember: true },
    })
  }

  await prisma.classroomMember.create({
    data: { classroomId: classroom.id, userId: session.userId },
  })

  const teacherName = classroom.teacher.firstName ?? classroom.teacher.username ?? 'Teacher'
  return NextResponse.json({
    classroom: { id: classroom.id, name: classroom.name, teacherName },
  }, { status: 201 })
}
