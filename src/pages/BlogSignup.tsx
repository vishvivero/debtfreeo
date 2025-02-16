
import { AuthForm } from "@/components/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BlogSignup = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <Link 
          to="/blog" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Link>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Join our Community
            </CardTitle>
            <CardDescription>
              Create an account to save your favorite articles, track your debt payoff journey, and get personalized financial insights.
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
  );
};

export default BlogSignup;
