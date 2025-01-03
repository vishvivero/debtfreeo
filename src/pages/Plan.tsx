import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

const Plan = () => {
  const steps = [
    {
      step: 1,
      remaining: "2 to go",
      accounts: [
        { name: "HSBC", payments: 59 },
        { name: "First Direct", payments: 58 }
      ],
      completionDate: "Dec 2, 2029",
      timeframe: "(4 years 10 months)"
    },
    {
      step: 2,
      remaining: "1 to go",
      accounts: [
        { 
          name: "First Direct",
          type: "Extra",
          payments: 27
        }
      ],
      completionDate: "Mar 2, 2032",
      timeframe: "(2 years 3 months)",
      payoff: {
        account: "HSBC",
        date: "Dec 5, 2029"
      }
    },
    {
      step: 3,
      remaining: "0 to go",
      payoff: {
        account: "First Direct",
        date: "Mar 2, 2032"
      },
      completionDate: "Mar 2, 2032",
      timeframe: "(0 days)"
    }
  ];

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold">Payoff Plan</h1>
          <Badge variant="secondary">Tutorial</Badge>
        </div>
        <p className="text-muted-foreground mb-8">
          The step-by-step plan to your debt-free future
        </p>

        <div className="grid gap-6">
          {steps.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-medium">
                      STEP {step.step}
                    </CardTitle>
                    <p className="text-sm text-blue-500">{step.remaining}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Completes on {step.completionDate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {step.timeframe}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {step.accounts && (
                  <div className="space-y-2">
                    {step.accounts.map((account, accIndex) => (
                      <div
                        key={accIndex}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="font-medium">{account.name}</span>
                        <div className="flex items-center gap-2">
                          {account.type && (
                            <Badge variant="secondary">{account.type}</Badge>
                          )}
                          <span>× {account.payments}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {step.payoff && (
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                    <Trophy className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{step.payoff.account} Payoff</p>
                      <p className="text-sm text-muted-foreground">
                        {step.payoff.date}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Plan;