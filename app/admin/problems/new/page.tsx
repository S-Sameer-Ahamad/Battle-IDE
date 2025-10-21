"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  examples: z.string().min(1, "Examples are required"),
  timeLimit: z.number().min(1000, "Time limit must be at least 1000ms"),
  memoryLimit: z.number().min(64, "Memory limit must be at least 64MB"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  testCases: z.array(z.object({
    input: z.string().min(1, "Input is required"),
    expectedOutput: z.string().min(1, "Expected output is required"),
  })).min(1, "At least one test case is required"),
  solution: z.string().min(1, "Solution is required"),
})

type ProblemFormData = z.infer<typeof problemSchema>

export default function NewProblemPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "" }])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProblemFormData>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      testCases: [{ input: "", expectedOutput: "" }],
    },
  })

  const addTestCase = () => {
    const newTestCases = [...testCases, { input: "", expectedOutput: "" }]
    setTestCases(newTestCases)
    setValue("testCases", newTestCases)
  }

  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      const newTestCases = testCases.filter((_, i) => i !== index)
      setTestCases(newTestCases)
      setValue("testCases", newTestCases)
    }
  }

  const updateTestCase = (index: number, field: "input" | "expectedOutput", value: string) => {
    const newTestCases = testCases.map((tc, i) => 
      i === index ? { ...tc, [field]: value } : tc
    )
    setTestCases(newTestCases)
    setValue("testCases", newTestCases)
  }

  const onSubmit = async (data: ProblemFormData) => {
    setIsLoading(true)
    try {
      // TODO: Implement actual problem creation logic
      console.log("Problem data:", data)
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Problem created successfully!")
      router.push("/admin/problems")
    } catch (error) {
      toast.error("Failed to create problem. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-cyan-500/20 bg-black/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold neon-text-cyan hover:opacity-80">
            ADMIN PANEL
          </Link>
          <button className="px-4 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Create New Problem</h1>
            <Link
              href="/admin/problems"
              className="px-6 py-2 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors"
            >
              Back to Problems
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title</label>
                  <input
                    {...register("title")}
                    className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Problem title"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Difficulty</label>
                  <select
                    {...register("difficulty")}
                    className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Time Limit (ms)</label>
                  <input
                    type="number"
                    {...register("timeLimit", { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="2000"
                  />
                  {errors.timeLimit && (
                    <p className="text-red-400 text-sm mt-1">{errors.timeLimit.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Memory Limit (MB)</label>
                  <input
                    type="number"
                    {...register("memoryLimit", { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="256"
                  />
                  {errors.memoryLimit && (
                    <p className="text-red-400 text-sm mt-1">{errors.memoryLimit.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Description</h2>
              <textarea
                {...register("description")}
                rows={6}
                className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Problem description in Markdown format..."
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Examples */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Examples</h2>
              <textarea
                {...register("examples")}
                rows={4}
                className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Example input/output in Markdown format..."
              />
              {errors.examples && (
                <p className="text-red-400 text-sm mt-1">{errors.examples.message}</p>
              )}
            </div>

            {/* Test Cases */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Test Cases</h2>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
                >
                  Add Test Case
                </button>
              </div>
              <div className="space-y-4">
                {testCases.map((testCase, index) => (
                  <div key={index} className="bg-black/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-semibold">Test Case {index + 1}</h3>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Input</label>
                        <textarea
                          value={testCase.input}
                          onChange={(e) => updateTestCase(index, "input", e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                          placeholder="Test input..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Expected Output</label>
                        <textarea
                          value={testCase.expectedOutput}
                          onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                          placeholder="Expected output..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.testCases && (
                <p className="text-red-400 text-sm mt-2">{errors.testCases.message}</p>
              )}
            </div>

            {/* Solution */}
            <div className="bg-accent-card border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Official Solution</h2>
              <textarea
                {...register("solution")}
                rows={8}
                className="w-full px-4 py-2 bg-black border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                placeholder="Official solution code..."
              />
              {errors.solution && (
                <p className="text-red-400 text-sm mt-1">{errors.solution.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Link
                href="/admin/problems"
                className="px-6 py-3 rounded-lg border border-cyan-500/30 text-white hover:bg-black/50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-lg font-bold transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                  color: "#0A0A0F",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Creating..." : "Create Problem"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
