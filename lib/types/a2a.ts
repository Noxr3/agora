// A2A JSON-RPC Task types
export interface A2ATextPart {
  type: 'text'
  text: string
}

export interface A2AFilePart {
  type: 'file'
  mimeType: string
  data?: string   // base64
  uri?: string
}

export type A2APart = A2ATextPart | A2AFilePart

export interface A2AMessage {
  role: 'user' | 'agent'
  parts: A2APart[]
  metadata?: Record<string, unknown>
}

export interface A2ATaskStatus {
  state: 'submitted' | 'working' | 'input-required' | 'completed' | 'failed' | 'canceled'
  message?: A2AMessage
  timestamp?: string
}

export interface A2AArtifact {
  name?: string
  description?: string
  parts: A2APart[]
  metadata?: Record<string, unknown>
  index?: number
  append?: boolean
  lastChunk?: boolean
}

export interface A2ATask {
  id: string
  sessionId?: string
  status: A2ATaskStatus
  artifacts?: A2AArtifact[]
  history?: A2AMessage[]
  metadata?: Record<string, unknown>
}

export interface A2ATaskSendParams {
  id: string
  sessionId?: string
  message: A2AMessage
  historyLength?: number
  metadata?: Record<string, unknown>
}

export interface A2AJsonRpcRequest {
  jsonrpc: '2.0'
  id: string | number
  method: string
  params?: Record<string, unknown>
}

export interface A2AJsonRpcResponse<T = unknown> {
  jsonrpc: '2.0'
  id: string | number | null
  result?: T
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

export interface A2AAgentCard {
  name: string
  description: string
  url: string
  version: string
  provider?: {
    organization: string
    url?: string
  }
  documentationUrl?: string
  capabilities?: {
    streaming?: boolean
    pushNotifications?: boolean
    stateTransitionHistory?: boolean
  }
  authentication: {
    schemes: string[]
    credentials?: string
  }
  defaultInputModes: string[]
  defaultOutputModes: string[]
  skills: Array<{
    id: string
    name: string
    description: string
    tags: string[]
    examples?: string[]
    inputModes?: string[]
    outputModes?: string[]
  }>
}
