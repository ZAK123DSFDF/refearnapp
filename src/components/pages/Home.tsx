"use client"
import Hero from "@/components/sections/Hero"
import Features from "@/components/sections/Features"
import HowItWorks from "@/components/sections/HowItWorks"
import Testimonials from "@/components/sections/Testimonials"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import PricingClient from "@/components/ui-custom/Pricing/PricingClient"
import FAQ from "@/components/sections/FAQ"

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <div id="pricing">
          <PricingClient
            dashboard={false}
            plan={null}
            showSubscription={true}
            showPurchase={true}
          />
        </div>
        <FAQ />
      </main>

      <Footer />
    </div>
  )
}

export default Home
