"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CopyButton } from "@/components/ui/copy-button"
import { Card } from "@/components/ui/card"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"

export default function SignupTrackingInstructions() {
  const [value, setValue] = useState("React / Next.js")
  const [origin, setOrigin] = useState("https://refearnapp.com")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  const guides = useMemo(
    () => [
      {
        name: "React / Next.js",
        description: "Install the SDK and use it in your signup components.",
        language: "tsx",
        code: `// 1. Install the SDK
// npm install @refearnapp/sdk

import { initRefearnapp, trackSignup } from "@refearnapp/sdk";

// 2. Initialize (Only once, e.g., in layout.tsx or _app.tsx)
initRefearnapp("${origin}");

// 3. Track signup in your form handler
const onSuccess = async (email: string) => {
  await trackSignup(email);
};`,
      },
      {
        name: "Vue",
        description: "Initialize in your main.js and use in your components.",
        language: "javascript",
        code: `// npm install @refearnapp/sdk

import { initRefearnapp, trackSignup } from "@refearnapp/sdk";

// Initialize in main.js
initRefearnapp("${origin}");

// In your component
const handleSignup = async (email) => {
  await trackSignup(email);
};`,
      },
      {
        name: "Svelte",
        description: "Add tracking to your SvelteKit or Svelte app.",
        language: "javascript",
        code: `// npm install @refearnapp/sdk

<script>
  import { initRefearnapp, trackSignup } from "@refearnapp/sdk";
  
  initRefearnapp("${origin}");

  async function onSignup(email) {
    await trackSignup(email);
  }
</script>`,
      },
      {
        name: "Plain JS",
        description: "Access the SDK directly via the window object.",
        language: "html",
        code: `<script src="${origin}/affiliateTrackingJavascript.js"></script>

<script>
  // 2. Access via the global window object
  window.refearnapp.initRefearnapp("${origin}");

  async function handleSignup(email) {
    await window.refearnapp.trackSignup(email);
  }
</script>`,
      },
    ],
    [origin]
  )

  return (
    <div className="mt-8 space-y-6 text-left">
      <div className="space-y-2">
        <h4 className="text-lg font-semibold">Track Leads (Signups)</h4>
        <p className="text-muted-foreground">
          {`Install our SDK to link a user's email address to the affiliate who referred them. This is required to calculate commissions when they eventually pay.`}
        </p>
      </div>

      <Tabs value={value} onValueChange={setValue} className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full h-auto gap-3 p-2">
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
