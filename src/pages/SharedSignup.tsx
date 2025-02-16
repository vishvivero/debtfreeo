
import { AuthForm } from "@/components/AuthForm";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, CheckCircle2, Clock, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";

const SharedSignup = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <Header />
      
      {/* Elegant animated background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-[0.05] bg-gradient-to-br from-primary/80 to-secondary/80"
              style={{
                width: '50%',
                height: '50%',
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 40, 0],
                y: [0, 30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                delay: i * 1.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative h-screen flex items-center z-10 pt-16">
        <div className="w-full grid md:grid-cols-2 gap-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-10 px-8 md:px-16 lg:px-24 flex flex-col justify-center"
          >
            <div className="space-y-6">
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm"
              >
                Welcome to DebtFreeo
              </motion.span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                Start Your <br className="hidden sm:block" />
                Journey to <br className="hidden sm:block" />
                Financial Freedom
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Join thousands of others who are taking control of their financial future
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
                  title: "Personalized Debt Strategy",
                  description: "Get a customized plan to become debt-free faster",
                  delay: 0.3
                },
                {
                  icon: <Newspaper className="h-6 w-6 text-primary" />,
                  title: "Expert Financial Content",
                  description: "Access our library of financial tips and strategies",
                  delay: 0.4
                },
                {
                  icon: <Clock className="h-6 w-6 text-primary" />,
                  title: "Time-Saving Tools",
                  description: "Use our calculators and tracking tools to manage your finances",
                  delay: 0.5
                },
                {
                  icon: <Share2 className="h-6 w-6 text-primary" />,
                  title: "Community Support",
                  description: "Connect with others on their debt-free journey",
                  delay: 0.6
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start gap-4 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: feature.delay, duration: 0.5 }}
                >
                  <div className="rounded-full p-2 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-200">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative bg-gradient-to-br from-gray-50/90 via-white/50 to-gray-50/90 h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 backdrop-blur-md"
          >
            <Card className="relative backdrop-blur-xl bg-white/80 border-0 shadow-xl shadow-black/5 ring-1 ring-black/5">
              <CardContent className="pt-6">
                <AuthForm defaultView="signup" />
              </CardContent>
            </Card>

            <div className="text-center text-sm text-gray-600 mt-6">
              <p>
                By signing up, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:text-primary/80 underline-offset-4 underline transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:text-primary/80 underline-offset-4 underline transition-colors">
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
