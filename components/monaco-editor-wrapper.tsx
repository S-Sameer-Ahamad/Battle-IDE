"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

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
}

export default function MonacoEditorWrapper({
  value,
  onChange,
  language,
  theme = "vs-dark",
}: MonacoEditorWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full bg-black flex items-center justify-center text-gray-400">Loading editor...</div>
      }
    >
      <MonacoEditor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={onChange}
        theme={theme}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "Fira Code, monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
        }}
      />
    </Suspense>
  )
}
