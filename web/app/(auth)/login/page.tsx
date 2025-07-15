import { LoginForm } from "@/components/auth/login-form"
import { AuthHeader } from "@/components/auth/auth-header"
import { AuthFooter } from "@/components/auth/auth-footer"

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      <div className="fixed inset-0 z-0 mesh-gradient opacity-70"></div>

      {/* Geometric background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/5 animate-spin-slow"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple/5 rotate-45 animate-float"></div>
        <div className="absolute top-1/3 -right-12 w-32 h-32 bg-accent/5 rotate-12 animate-pulse"></div>
        <div className="absolute inset-0 grid-pattern opacity-50"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <AuthHeader />

        <main className="flex-1 flex items-center justify-center p-4">
          <LoginForm />
        </main>

        <AuthFooter />
      </div>
    </div>
  )
}
