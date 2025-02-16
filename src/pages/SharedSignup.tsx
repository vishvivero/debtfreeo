
import { AuthForm } from "@/components/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, CheckCircle2, Clock, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SharedSignup = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-[0.08] bg-primary"
              style={{
                width: '40%',
                height: '40%',
                borderRadius: '40%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 30, 0],
                y: [0, 20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative h-screen flex items-center z-10">
        <div className="w-full grid md:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 px-8 md:px-16 lg:px-24"
          >
            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Welcome to DebtFreeo
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Start Your Journey to Financial Freedom
              </h1>
              <p className="text-xl text-gray-600">
                Join thousands of others who are taking control of their financial future
              </p>
            </div>

            <div className="space-y-6">
              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle2 className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-lg">Personalized Debt Strategy</h3>
                  <p className="text-gray-600">
                    Get a customized plan to become debt-free faster
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Newspaper className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-lg">Expert Financial Content</h3>
                  <p className="text-gray-600">
                    Access our library of financial tips and strategies
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Clock className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-lg">Time-Saving Tools</h3>
                  <p className="text-gray-600">
                    Use our calculators and tracking tools to manage your finances
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Share2 className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-lg">Community Support</h3>
                  <p className="text-gray-600">
                    Connect with others on their debt-free journey
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6 bg-gray-50/50 h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24"
          >
            <Card className="backdrop-blur-sm bg-white/80">
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
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SharedSignup;
