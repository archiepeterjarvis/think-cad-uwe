import {Button} from "@/components/ui/button";
import {ArrowRight, Play, Sparkles} from "lucide-react";
import {Cube3D} from "@/components/homepage/cube-3d";
import Link from "next/link";

export function Hero() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm mb-8">
            <Sparkles className="mr-2 h-4 w-4 text-primary animate-pulse"/>
            <span>Transform ideas into CAD models instantly</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            From Text to{" "}
            <span className="text-gradient font-extrabold">3D CAD Models</span>{" "}
            in Seconds
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Describe your design in plain English and watch as our AI transforms
            your words into precise, professional CAD models ready for
            manufacturing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/chat">
              <Button
                size="lg"
                className="text-lg px-8 bg-gradient-to-r from-primary to-purple hover:opacity-90 transition-opacity"
              >
                Start Creating
                <ArrowRight className="ml-2 h-5 w-5"/>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 border-primary/20 hover:bg-primary/5"
            >
              <Play className="mr-2 h-5 w-5 text-primary"/>
              Watch Demo
            </Button>
          </div>

          <div className="gradient-border p-8 shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h3 className="font-semibold mb-2 flex items-center">
                  <span
                    className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2">
                    1
                  </span>
                  Input:
                </h3>
                <div className="bg-muted/70 p-4 rounded-lg text-sm font-mono relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-purple/40"></div>
                  "Create a rectangular bracket with mounting holes, 100mm x
                  50mm x 10mm thick, with 6mm diameter holes 20mm from each
                  corner"
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold mb-2 flex items-center">
                  <span
                    className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs mr-2">
                    2
                  </span>
                  Output:
                </h3>
                <div
                  className="bg-gradient-to-br from-primary/5 to-purple/5 p-6 rounded-lg flex items-center justify-center h-32 relative">
                  <div className="absolute inset-0 blueprint-bg opacity-30"></div>
                  <Cube3D/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div
        className="absolute top-1/4 left-10 w-24 h-24 border-2 border-dashed border-primary/20 rounded-lg rotate-12 opacity-70"></div>
      <div
        className="absolute bottom-1/4 right-10 w-32 h-32 border-2 border-dashed border-purple/20 rounded-full opacity-70"></div>
    </section>
  );
}
