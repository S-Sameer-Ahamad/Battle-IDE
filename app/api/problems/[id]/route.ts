import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const problemId = parseInt(id)

    if (isNaN(problemId)) {
      return NextResponse.json(
        { error: 'Invalid problem ID' },
        { status: 400 }
      )
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    })

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ problem })
  } catch (error) {
    console.error('Error fetching problem:', error)
    return NextResponse.json(
      { error: 'Failed to fetch problem' },
      { status: 500 }
    )
  }
}
