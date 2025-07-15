import { Card, CardContent } from "@/components/ui/card";
import { Brain, Download, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Describe Your Design",
    description:
      "Write a natural language description of what you want to create. Be as detailed or as simple as you like.",
    color: "primary",
  },
  {
    icon: Brain,
    title: "AI Processing",
    description:
      "Our advanced AI analyzes your description and generates a precise 3D CAD model with proper dimensions and features.",
    color: "purple",
  },
  {
    icon: Download,
    title: "Download & Use",
    description:
      "Export your model in your preferred format and import it directly into your favorite CAD software.",
    color: "accent",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient-dark"></div>
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-purple/10 text-purple text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Three Simple Steps
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From concept to CAD in minutes, not hours
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const colorClass = `${step.color}` as keyof (typeof steps)[0];
            return (
              <div key={index} className="relative">
                <Card className="text-center h-full border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <CardContent className="pt-12 pb-12 relative">
                    <div
                      className={`w-16 h-16 bg-${colorClass}/10 rounded-full flex items-center justify-center mx-auto mb-6`}
                    >
                      <step.icon className={`h-8 w-8 text-${colorClass}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border transform -translate-y-1/2 z-20"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
