"use client";

import { Car, Cpu, Home, Lightbulb, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UseChatHelpers } from "@ai-sdk/react";

const examplePrompts = [
  {
    icon: Wrench,
    title: "Mounting Bracket",
    description: "Create a rectangular mounting bracket with holes",
    prompt:
      "Create a rectangular mounting bracket, 100mm x 50mm x 10mm thick, with 6mm diameter holes 20mm from each corner",
    color: "primary",
  },
  {
    icon: Home,
    title: "Custom Enclosure",
    description: "Design a waterproof electronics enclosure",
    prompt:
      "Design a waterproof rectangular enclosure for electronics, 150mm x 100mm x 75mm, with cable entry ports and mounting tabs",
    color: "teal",
  },
  {
    icon: Cpu,
    title: "Heat Sink",
    description: "Generate a finned heat sink for cooling",
    prompt:
      "Create a heat sink with parallel fins, base 40mm x 40mm x 5mm thick, with 8 fins each 30mm tall and 2mm thick",
    color: "purple",
  },
  {
    icon: Car,
    title: "Custom Gear",
    description: "Design a spur gear with specific teeth",
    prompt:
      "Generate a spur gear with 24 teeth, 50mm outer diameter, 20mm bore, 8mm thick, with a keyway",
    color: "orange",
  },
];

export function ExamplePrompts({
  append,
  chatId,
}: {
  append: UseChatHelpers["append"];
  chatId: string;
}) {
  return (
    <div className="w-full max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm mb-4">
            <Lightbulb className="mr-2 h-4 w-4 text-primary animate-pulse" />
            <span>Get started with these examples</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            What would you like to <span className="text-gradient">create</span>{" "}
            today?
          </h1>
          <p className="text-muted-foreground">
            Describe your design in natural language and watch it come to life
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        <div className="grid md:grid-cols-2 gap-4">
          {examplePrompts.map((example, index) => {
            const colorClass =
              `${example.color}` as keyof (typeof examplePrompts)[0];
            return (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-shadow border-0 overflow-hidden group"
                onClick={async () => {
                  window.history.replaceState({}, "", `/chat/${chatId}`);

                  append({
                    role: "user",
                    content: example.prompt,
                  });
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-${colorClass}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <example.icon className={`h-6 w-6 text-${colorClass}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{example.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {example.description}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-${colorClass}/20 hover:bg-${colorClass}/5 text-${colorClass}`}
                      >
                        Try this example
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Or start typing your own description in the chat box below
        </p>
      </motion.div>
    </div>
  );
}
