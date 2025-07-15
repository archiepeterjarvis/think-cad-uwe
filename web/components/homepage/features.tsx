import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Layers, Zap } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Generate complex CAD models in seconds, not hours. Our AI understands engineering terminology and design intent.",
    color: "primary",
  },
  {
    icon: Download,
    title: "Multiple Formats",
    description:
      "Export to STEP, STL, DWG, and other industry-standard formats compatible with all major CAD software.",
    color: "purple",
  },
  {
    icon: Layers,
    title: "Parametric Design",
    description:
      "Easily modify dimensions and features by updating your text description. No need to rebuild from scratch.",
    color: "accent",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 relative">
      <div className="absolute inset-0 blueprint-bg opacity-30"></div>
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for Modern Design
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to transform your ideas into professional CAD
            models
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const colorClass = `${feature.color}` as keyof (typeof features)[0];
            return (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-lg transition-shadow group overflow-hidden relative"
              >
                <div
                  className={`absolute inset-0 bg-${colorClass}/5 opacity-0 group-hover:opacity-100 transition-opacity`}
                ></div>
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-${colorClass}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className={`h-6 w-6 text-${colorClass}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
