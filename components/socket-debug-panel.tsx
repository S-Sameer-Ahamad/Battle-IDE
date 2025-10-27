"use client"

import { useState } from 'react'

interface SocketDebugPanelProps {
  connected: boolean
  matchId: string
  submitCode: (code: string, language: string) => void
  sendMessage: (message: string) => void
  submissions: any[]
  messages: any[]
}

export function SocketDebugPanel({
  connected,
  matchId,
  submitCode,
  sendMessage,
  submissions,
  messages,
}: SocketDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [testCode, setTestCode] = useState('console.log("Hello World")')
  const [testMessage, setTestMessage] = useState('')

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-all z-50"
        title="Open Socket Debug Panel"
      >
        🔧 Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-900 border border-cyan-500/30 rounded-lg shadow-2xl z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-cyan-500/20">
        <h3 className="text-white font-bold flex items-center gap-2">
          🔧 Socket Debug Panel
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto p-4 space-y-4 flex-1">
        {/* Connection Status */}
        <div className="bg-black/50 rounded-lg p-3">
          <div className="text-sm font-bold text-white mb-2">Connection Status</div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}
            ></span>
            <span className={connected ? 'text-green-400' : 'text-red-400'}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">Match ID: {matchId}</div>
        </div>

        {/* Test Submission */}
        <div className="bg-black/50 rounded-lg p-3">
          <div className="text-sm font-bold text-white mb-2">Test Code Submission</div>
          <textarea
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            className="w-full px-2 py-1 bg-black border border-cyan-500/30 rounded text-white text-xs mb-2"
            rows={3}
            placeholder="Enter test code..."
          />
          <button
            onClick={() => submitCode(testCode, 'javascript')}
            disabled={!connected}
            className="w-full px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
          >
            Submit Test Code
          </button>
        </div>

        {/* Test Chat */}
        <div className="bg-black/50 rounded-lg p-3">
          <div className="text-sm font-bold text-white mb-2">Test Chat Message</div>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && testMessage) {
                sendMessage(testMessage)
                setTestMessage('')
              }
            }}
            className="w-full px-2 py-1 bg-black border border-cyan-500/30 rounded text-white text-xs mb-2"
            placeholder="Enter test message..."
          />
          <button
            onClick={() => {
              if (testMessage) {
                sendMessage(testMessage)
                setTestMessage('')
              }
            }}
            disabled={!connected}
            className="w-full px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
          >
            Send Message
          </button>
        </div>

        {/* Submissions Log */}
        <div className="bg-black/50 rounded-lg p-3">
          <div className="text-sm font-bold text-white mb-2">
            Submissions ({submissions.length})
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
            {submissions.length === 0 ? (
              <div className="text-gray-500">No submissions yet</div>
            ) : (
              submissions.slice(-5).reverse().map((sub, idx) => (
                <div key={idx} className="text-gray-300 border-b border-gray-700 pb-1">
                  <div className="flex justify-between">
                    <span className="text-cyan-400">{sub.username || sub.userId}</span>
                    <span className="text-green-400">
                      {sub.passedTests || 0}/{sub.totalTests || 0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Log */}
        <div className="bg-black/50 rounded-lg p-3">
          <div className="text-sm font-bold text-white mb-2">
            Messages ({messages.length})
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
            {messages.length === 0 ? (
              <div className="text-gray-500">No messages yet</div>
            ) : (
              messages.slice(-5).reverse().map((msg, idx) => (
                <div key={idx} className="text-gray-300 border-b border-gray-700 pb-1">
                  <span className="text-cyan-400">{msg.username}: </span>
                  <span>{msg.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
          <div className="text-xs text-purple-300">
            <div className="font-bold mb-1">💡 Testing Tips:</div>
            <ul className="list-disc list-inside space-y-1 text-purple-200">
              <li>Open in 2 incognito windows</li>
              <li>Login as different users</li>
              <li>Join same match ID</li>
              <li>Test submissions & chat</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
