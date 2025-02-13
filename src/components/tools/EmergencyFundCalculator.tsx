
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  monthlyExpenses: z.string().min(1, "Monthly expenses are required"),
  dependents: z.string().min(1, "Number of dependents is required"),
  riskLevel: z.string().min(1, "Risk level is required"),
});

export function EmergencyFundCalculator() {
  const [result, setResult] = useState<{
    recommendedAmount: number;
    monthsOfExpenses: number;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyExpenses: "",
      dependents: "",
      riskLevel: "moderate",
    },
  });

  function calculateEmergencyFund(values: z.infer<typeof formSchema>) {
    const expenses = parseFloat(values.monthlyExpenses);
    const dependents = parseInt(values.dependents);
    let monthsOfExpenses = 3; // Base months

    // Adjust months based on risk level
    switch (values.riskLevel) {
      case "low":
        monthsOfExpenses = 3;
        break;
      case "moderate":
        monthsOfExpenses = 6;
        break;
      case "high":
        monthsOfExpenses = 9;
        break;
    }

    // Add additional months for dependents
    monthsOfExpenses += Math.min(dependents, 3);

    const recommendedAmount = expenses * monthsOfExpenses;

    setResult({
      recommendedAmount,
      monthsOfExpenses,
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Emergency Fund Calculator</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(calculateEmergencyFund)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="monthlyExpenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Expenses (£)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter your monthly expenses"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dependents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Dependents</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter number of dependents"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="riskLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background border border-input">
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border border-input">
                      <SelectItem value="low">Low Risk (3 months)</SelectItem>
                      <SelectItem value="moderate">
                        Moderate Risk (6 months)
                      </SelectItem>
                      <SelectItem value="high">High Risk (9 months)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Calculate
            </Button>
          </form>
        </Form>

        {result && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg space-y-2">
            <h3 className="font-semibold">Recommended Emergency Fund:</h3>
            <p className="text-2xl font-bold">
              £{result.recommendedAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Based on {result.monthsOfExpenses} months of expenses
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
