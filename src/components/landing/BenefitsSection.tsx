
import { motion } from "framer-motion";
import { CheckCircle2, Shield, Award, Timer } from "lucide-react";

const benefits = [
  { icon: CheckCircle2, text: "Regain control of your finances" },
  { icon: Shield, text: "Build a solid financial foundation" },
  { icon: Award, text: "Live a debt-free life" },
  { icon: Timer, text: "See results faster than ever" },
];

const BenefitsSection = () => {
  return (
    <section className="py-12 md:py-16 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-4 md:p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="mb-4"
              >
                <benefit.icon className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              </motion.div>
              <p className="text-base md:text-lg text-gray-800 font-medium">{benefit.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
