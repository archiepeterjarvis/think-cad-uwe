import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CuboidIcon as Cube } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-primary/10 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/public" className="flex items-center space-x-2">
          <div className="relative">
            <Cube className="h-8 w-8 text-primary" />
          </div>
          <span className="text-lg font-bold">
            think<span className="text-gradient">CAD</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="#features"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="#use-cases"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Use Cases
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="hover:text-primary hover:bg-primary/10"
            asChild
          >
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-primary to-purple hover:opacity-90 transition-opacity"
          >
            Try Free
          </Button>
        </div>
      </div>
    </header>
  );
}
