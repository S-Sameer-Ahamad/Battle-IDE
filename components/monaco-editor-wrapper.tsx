"use client"

import dynamic from "next/dynamic"
import { Suspense, useRef } from "react"
import { toast } from "sonner"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black flex items-center justify-center text-gray-400">Loading editor...</div>
  ),
})

interface MonacoEditorWrapperProps {
  value: string
  onChange: (value: string | undefined) => void
  language: string
  theme?: string
  readOnly?: boolean
  onRun?: (code: string) => void
  onSubmit?: (code: string) => void
  showControls?: boolean
  height?: string
}

export default function MonacoEditorWrapper({
  value,
  onChange,
  language,
  theme = "vs-dark",
  readOnly = false,
  onRun,
  onSubmit,
  showControls = true,
  height = "100%",
}: MonacoEditorWrapperProps) {
  const editorRef = useRef<any>(null)

  const handleRun = () => {
    if (onRun) {
      onRun(value)
      toast.success("Code executed successfully!")
    }
  }

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(value)
      toast.success("Solution submitted!")
    }
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleSubmit()
    })
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
      handleRun()
    })
  }

  return (
    <div className="w-full h-full flex flex-col">
      {showControls && (
        <div className="bg-black/50 border-b border-cyan-500/20 px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-cyan-400 text-sm font-semibold">
              {language.toUpperCase()}
            </span>
            <span className="text-gray-400 text-xs">
              Ctrl+Enter to Submit • Ctrl+R to Run
            </span>
          </div>
          <div className="flex gap-2">
            {onRun && (
              <button
                onClick={handleRun}
                className="px-3 py-1 text-xs bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
              >
                Run
              </button>
            )}
            {onSubmit && (
              <button
                onClick={handleSubmit}
                className="px-3 py-1 text-xs font-bold rounded transition-colors"
                style={{
                  background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                  color: "#0A0A0F",
                }}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <Suspense
          fallback={
            <div className="w-full h-full bg-black flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
                Loading editor...
              </div>
            </div>
          }
        >
          <MonacoEditor
            height={height}
            defaultLanguage={language}
            language={language}
            value={value}
            onChange={onChange}
            theme={theme}
            onMount={handleEditorDidMount}
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "Fira Code, Consolas, 'Courier New', monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              padding: { top: 16, bottom: 16 },
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: true,
              renderWhitespace: "selection",
              selectOnLineNumbers: true,
              roundedSelection: false,
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
              },
            }}
          />
        </Suspense>
      </div>
    </div>
  )
}
