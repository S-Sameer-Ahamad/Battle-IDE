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

export async function PUT(
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

    // Check if problem exists
    const existingProblem = await prisma.problem.findUnique({
      where: { id: problemId },
    })

    if (!existingProblem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      )
    }

    // Update problem
    const problem = await prisma.problem.update({
      where: { id: problemId },
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

    return NextResponse.json({ problem })
  } catch (error) {
    console.error('Error updating problem:', error)
    return NextResponse.json(
      { error: 'Failed to update problem' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if problem exists
    const existingProblem = await prisma.problem.findUnique({
      where: { id: problemId },
    })

    if (!existingProblem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      )
    }

    // Check if problem is used in any matches
    const matchesUsingProblem = await prisma.match.count({
      where: { problemId },
    })

    if (matchesUsingProblem > 0) {
      return NextResponse.json(
        { error: 'Cannot delete problem that is used in matches' },
        { status: 400 }
      )
    }

    // Delete problem
    await prisma.problem.delete({
      where: { id: problemId },
    })

    return NextResponse.json({ message: 'Problem deleted successfully' })
  } catch (error) {
    console.error('Error deleting problem:', error)
    return NextResponse.json(
      { error: 'Failed to delete problem' },
      { status: 500 }
    )
  }
}
