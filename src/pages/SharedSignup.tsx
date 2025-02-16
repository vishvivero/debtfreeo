
import { AuthForm } from "@/components/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, CheckCircle2, Clock, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const SharedSignup = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] grid md:grid-cols-2 gap-8 p-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Join Our Community
            </h1>
            <p className="text-muted-foreground mt-2">
              Take control of your financial future with DebtFreeo
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Personalized Debt Strategy</h3>
                <p className="text-sm text-muted-foreground">
                  Get a customized plan to become debt-free faster
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Newspaper className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Expert Financial Content</h3>
                <p className="text-sm text-muted-foreground">
                  Access our library of financial tips and strategies
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Time-Saving Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Use our calculators and tracking tools to manage your finances
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Share2 className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Community Support</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with others on their debt-free journey
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>
                Get started with your free account today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthForm defaultView="signup" />
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              By signing up, you agree to our{" "}
              <Link to="/terms" className="underline hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline hover:text-primary">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedSignup;
