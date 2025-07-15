import { Hero } from "@/components/homepage/hero";
import { Features } from "@/components/homepage/features";
import { HowItWorks } from "@/components/homepage/how-it-works";
import { UseCases } from "@/components/homepage/use-cases";
import { CTA } from "@/components/homepage/cta";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GeometricShapes } from "@/components/homepage/geometric-shapes";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="fixed inset-0 z-0 mesh-gradient opacity-70"></div>
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <UseCases />
          <CTA />
        </main>
        <Footer />
      </div>
      <GeometricShapes />
    </div>
  );
}
