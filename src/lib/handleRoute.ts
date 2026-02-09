// lib/handleRoute.ts
import { NextRequest, NextResponse } from "next/server"
import { returnError } from "@/lib/errorHandler"

export function handleRoute<T = any>(
  name: string,
  handler: (req: NextRequest, params: T) => Promise<NextResponse | Response>
) {
  return async (req: NextRequest, context: { params: Promise<T> }) => {
    const start = performance.now()
    try {
      const resolvedParams = await context.params
      const response = await handler(req, resolvedParams)

      const end = performance.now()
      // Optional: Log redirects differently
      const status = response.status
      console.info(
        `✅ [API] ${name} (${status}) completed in ${Math.round(end - start)}ms`
      )

      return response
    } catch (err: any) {
      // If the error itself is a Response (some frameworks throw redirects), return it
      if (err instanceof Response) return err

      console.error(`❌ [API] ${name} error:`, err)
      const errorData = returnError(err)

      return NextResponse.json(
        {
          error: errorData.error,
          toast: errorData.toast,
          fields: errorData.fields,
        },
        { status: errorData.status }
      )
    }
  }
}
