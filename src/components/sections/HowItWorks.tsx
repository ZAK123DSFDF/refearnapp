import React from "react"
import {
  Settings,
  Code2,
  Share2,
  BarChart3,
  ChevronDown,
  CreditCard,
} from "lucide-react"

const steps = [
  {
    number: "01",
    icon: <Settings className="w-10 h-10 text-primary" />,
    title: "Create Your Organization",
    description:
      "Set up your organization with custom cookie settings, flexible commission tiers, and tracking rules tailored for your SaaS.",
  },
  {
    number: "02",
    icon: <Code2 className="w-10 h-10 text-primary" />,
    title: "Connect Your Web App",
    description:
      "Add a lightweight script snippet to your frontend. No complexity — drop it in and start tracking instantly.",
  },
  {
    number: "03",
    icon: <CreditCard className="w-10 h-10 text-primary" />,
    title: "Integrate Checkout Tracking",
    description:
      "Pass the tracking ID to your payment processor (like Paddle or Stripe) to automatically attribute successful sales to your partners.",
  },
  {
    number: "04",
    icon: <Share2 className="w-10 h-10 text-primary" />,
    title: "Share Your Affiliate Portal",
    description:
      "Invite partners and give them a branded portal where they can generate links, view stats, and track progress.",
  },
  {
    number: "05",
    icon: <BarChart3 className="w-10 h-10 text-primary" />,
    title: "Track Performance Seamlessly",
    description:
      "Monitor real-time analytics as your affiliates drive signups and revenue. Optimize your growth effortlessly.",
  },
]

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-secondary/50">
      <div className="container mx-auto max-w-3xl">
        {/* Title + Description */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How <span className="text-blue-600">It Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple, guided four-step workflow to launch and scale your
            affiliate program — without any technical overhead.
          </p>
        </div>

        <div className="flex flex-col items-center gap-12">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              {/* CARD */}
              <div className="w-full bg-white dark:bg-neutral-900 shadow-lg rounded-2xl p-8 text-center animate-fade-in">
                {/* Number + Icon */}
                <div className="flex flex-col items-center gap-3 mb-4">
                  <div className="text-primary/30 text-4xl font-bold">
                    {step.number}
                  </div>
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>

                {/* Description */}
                <p className="text-muted-foreground text-lg">
                  {step.description}
                </p>
              </div>

              {/* Vertical arrow between steps */}
              {index < steps.length - 1 && (
                <ChevronDown className="w-10 h-10 text-primary/40 animate-bounce-slow" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
