import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wrench, Home, Cpu, Car } from "lucide-react";

const useCases = [
  {
    icon: Wrench,
    title: "Mechanical Parts",
    description:
      "Brackets, housings, gears, and custom mechanical components for manufacturing and prototyping.",
    examples: [
      "Mounting brackets",
      "Custom enclosures",
      "Mechanical fasteners",
      "Tool accessories",
    ],
    color: "primary",
  },
  {
    icon: Home,
    title: "Architecture & Construction",
    description:
      "Structural elements, fixtures, and architectural components for building and construction projects.",
    examples: [
      "Structural beams",
      "Custom fixtures",
      "Architectural details",
      "Building components",
    ],
    color: "teal",
  },
  {
    icon: Cpu,
    title: "Electronics & Tech",
    description:
      "Enclosures, heat sinks, and custom parts for electronic devices and technology products.",
    examples: [
      "PCB enclosures",
      "Heat sinks",
      "Cable management",
      "Device housings",
    ],
    color: "purple",
  },
  {
    icon: Car,
    title: "Automotive & Aerospace",
    description:
      "Custom parts, fixtures, and components for automotive and aerospace applications.",
    examples: [
      "Custom brackets",
      "Jigs and fixtures",
      "Prototype parts",
      "Replacement components",
    ],
    color: "orange",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-20 relative">
      <div className="absolute inset-0 geometric-bg"></div>
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-teal/10 text-teal text-sm font-medium mb-4">
            Use Cases
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perfect for Every Industry
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From rapid prototyping to production parts, thinkCAD serves diverse
            industries and applications
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => {
            const colorClass = `${useCase.color}` as keyof (typeof useCases)[0];
            return (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 bg-${colorClass}/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <useCase.icon className={`h-6 w-6 text-${colorClass}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{useCase.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {useCase.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2">
                    {useCase.examples.map((example, idx) => (
                      <span
                        key={idx}
                        className={`bg-${colorClass}/10 text-${colorClass} px-3 py-1 rounded-full text-sm`}
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
