import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container relative z-10">
        <Card className="border-0 overflow-hidden bg-gradient-to-br from-primary/20 via-purple/10 to-accent/5">
          <div className="absolute inset-0 blueprint-bg opacity-10"></div>
          <CardContent className="p-12 text-center relative">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm mb-6">
                <Sparkles className="mr-2 h-4 w-4 text-primary animate-pulse" />
                <span>Ready to revolutionize your design process?</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Start Creating <span className="text-gradient">CAD Models</span>{" "}
                from Text Today
              </h2>

              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join engineers, designers, and makers who are already using
                thinkCAD to bring their ideas to life faster than ever before.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-lg px-8 bg-gradient-to-r from-primary to-purple hover:opacity-90 transition-opacity"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Decorative elements */}
        <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-primary/10 animate-pulse"></div>
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-purple/10 animate-float"></div>
      </div>
    </section>
  );
}
