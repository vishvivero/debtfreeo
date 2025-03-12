import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { EmailForm } from "./auth/EmailForm";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  onSuccess?: () => void;
  defaultView?: "signin" | "signup";
}

export function AuthForm({ onSuccess, defaultView = "signin" }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(defaultView === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const sendWelcomeEmail = async (email: string) => {
    console.log("Attempting to send welcome email to:", email);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { email }
      });
      
      if (error) {
        console.error('Error sending welcome email:', error);
        throw error;
      }
      
      console.log('Welcome email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Critical error sending welcome email:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (!policyAgreed) {
          throw new Error("You must agree to the Terms of Service and Privacy Policy");
        }
        
        console.log("Attempting to sign up user with email:", email);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/overview`,
            data: {
              has_accepted_policies: policyAgreed,
              has_marketing_consent: marketingConsent
            }
          }
        });
        
        if (signUpError) {
          console.error("Sign up error:", signUpError);
          throw signUpError;
        }
        
        console.log("Sign up successful:", signUpData);
        
        // Update profile flags directly after signup
        if (signUpData.user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              has_accepted_policies: policyAgreed,
              has_marketing_consent: marketingConsent
            })
            .eq('id', signUpData.user.id);

          if (updateError) {
            console.error("Error updating profile flags:", updateError);
          }
        }
        
        try {
          await sendWelcomeEmail(email);
          console.log("Welcome email flow completed");
          // Redirect to overview page after successful signup
          navigate("/overview");
        } catch (emailError) {
          console.error("Welcome email failed but signup succeeded:", emailError);
          // Still redirect even if welcome email fails
          navigate("/overview");
        }
        
        toast({
          title: "Check your email",
          description: "We've sent you a verification link to complete your registration.",
        });
      } else {
        console.log("Attempting to sign in with email:", email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Sign in error:", error);
          throw error;
        }
        
        console.log("Sign in successful:", data);
        // Redirect to overview page after successful signin
        navigate("/overview");
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Authentication Error:', error);
      
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "An unexpected error occurred during authentication.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset password email.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <p className="text-muted-foreground">
            {isSignUp
              ? "Enter your details to create your account"
              : "Enter your credentials to access your account"}
          </p>
        </div>

        <EmailForm
          isSignUp={isSignUp}
          isLoading={isLoading}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          onForgotPassword={handleForgotPassword}
          onSubmit={handleSubmit}
          policyAgreed={policyAgreed}
          setPolicyAgreed={setPolicyAgreed}
          marketingConsent={marketingConsent}
          setMarketingConsent={setMarketingConsent}
        />

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Sign in" : "Create account"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};