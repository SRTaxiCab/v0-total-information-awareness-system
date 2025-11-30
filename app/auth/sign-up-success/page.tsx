import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>Confirm your account to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We've sent you a confirmation email. Please check your inbox and click the confirmation link to activate
              your account.
            </p>
            <Link href="/auth/login" className="block">
              <Button className="w-full">Return to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
