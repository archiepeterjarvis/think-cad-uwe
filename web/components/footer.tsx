import Link from "next/link";
import { CuboidIcon as Cube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-background/80 backdrop-blur-sm relative">
      <div className="absolute inset-0 geometric-bg opacity-30"></div>
      <div className="container py-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/public" className="flex items-center space-x-2">
              <div className="relative">
                <Cube className="h-6 w-6 text-primary" />
              </div>
              <span className="text-lg font-bold">
                think<span className="text-gradient">CAD</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Transform your ideas into professional CAD models with the power
              of AI and natural language processing.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-primary">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  API
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-purple">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-purple transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-purple transition-colors"
                >
                  Tutorials
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-purple transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-purple transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-accent">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-accent transition-colors"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 thinkCAD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
