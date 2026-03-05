"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CopyButton } from "@/components/ui/copy-button"
import { Card } from "@/components/ui/card"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"

export default function SignupTrackingInstructions() {
  const [value, setValue] = useState("JavaScript")
  const [origin, setOrigin] = useState("https://refearnapp.com")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const guides = useMemo(
    () => [
      {
        name: "JavaScript",
        description: "Initialize the SDK and track signups in plain JS.",
        language: "javascript",
        code: `// 1. Initialize with your tracking domain
initRefearnapp("${origin}");

// 2. Call this function when a user successfully signs up
async function handleUserSignup(userEmail) {
  const result = await trackSignup(userEmail);
  if (result.success) {
     console.log("Lead captured!");
  }
}`,
      },
      {
        name: "React / Next.js",
        description: "Use inside your signup form component or a custom hook.",
        language: "tsx",
        code: `"use client"
import { initRefearnapp, trackSignup } from "@refearnapp/sdk";

// Initialize once at the root or in a useEffect
initRefearnapp("${origin}");

export default function SignupForm() {
  const onSignupSuccess = async (email: string) => {
    await trackSignup(email);
  };

  return (
    // Your form logic...
  );
}`,
      },
    ],
    [origin]
  )

  return (
    <div className="mt-8 space-y-6 text-left">
      <div className="space-y-2">
        <h4 className="text-lg font-semibold">Track Leads (Signups)</h4>
        <p className="text-muted-foreground">
          Use the SDK to link a user&apos;s email address to the affiliate who
          referred them. This is required for automated commission payouts.
        </p>
      </div>

      <Tabs value={value} onValueChange={setValue} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md h-auto gap-3 p-2">
          {guides.map((g) => (
            <TabsTrigger key={g.name} value={g.name}>
              {g.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {guides.map((g) => (
          <TabsContent key={g.name} value={g.name} className="pt-4">
            <p className="mb-2 text-sm text-muted-foreground">
              {g.description}
            </p>
            <Card className="relative w-full p-0 overflow-hidden rounded-xl">
              <CopyButton
                className="absolute top-2 right-2 z-10 text-white"
                value={g.code}
              />
              <SyntaxHighlighter
                language={g.language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  fontSize: "0.875rem",
                  backgroundColor: "#1e1e1e",
                }}
              >
                {g.code}
              </SyntaxHighlighter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
