import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const difficulty = searchParams.get('difficulty')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = difficulty ? { difficulty } : {}

    const problems = await prisma.problem.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ problems })
  } catch (error) {
    console.error('Error fetching problems:', error)
    return NextResponse.json(
      { error: 'Failed to fetch problems' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      examples, 
      difficulty, 
      timeLimit, 
      memoryLimit, 
      testCases, 
      solution 
    } = body

    // Validate required fields
    if (!title || !description || !examples || !difficulty || !timeLimit || !memoryLimit || !testCases || !solution) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate difficulty
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      )
    }

    // Validate test cases
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: 'At least one test case is required' },
        { status: 400 }
      )
    }

    // Create problem
    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        examples,
        difficulty,
        timeLimit: parseInt(timeLimit),
        memoryLimit: parseInt(memoryLimit),
        testCases: JSON.stringify(testCases),
        solution,
      },
    })

    return NextResponse.json({ problem }, { status: 201 })
  } catch (error) {
    console.error('Error creating problem:', error)
    return NextResponse.json(
      { error: 'Failed to create problem' },
      { status: 500 }
    )
  }
}
