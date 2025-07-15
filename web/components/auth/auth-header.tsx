import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CuboidIcon as Cube } from "lucide-react";

export function AuthHeader() {
  return (
    <header className="border-b border-primary/10 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative">
            <Cube className="h-8 w-8 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
          </div>
          <span className="text-xl font-bold">
            think<span className="text-gradient">CAD</span>
          </span>
        </Link>

        <Button variant="ghost" asChild>
          <Link href="/" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </header>
  );
}
