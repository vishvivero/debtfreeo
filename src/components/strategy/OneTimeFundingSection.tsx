
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { OneTimeFunding } from "@/lib/types/payment";
import { format } from "date-fns";

interface OneTimeFundingSectionProps {
  oneTimeFundings: OneTimeFunding[];
  onAddFunding: () => void;
  onRemoveFunding: (id: string) => void;
  currencySymbol?: string;
}

export const OneTimeFundingSection = ({
  oneTimeFundings,
  onAddFunding,
  onRemoveFunding,
  currencySymbol = "£"
}: OneTimeFundingSectionProps) => {
  const totalFunding = oneTimeFundings.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            One-time Funding
          </div>
          {totalFunding > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              Total: {currencySymbol}{totalFunding.toLocaleString()}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground -mt-4">
          Schedule lump sum payments to pay off debt faster and save on interest
        </p>
        
        {oneTimeFundings.length > 0 ? (
          <div className="space-y-3">
            {oneTimeFundings.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div>
                  <p className="font-medium text-primary">
                    {currencySymbol}{entry.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(entry.payment_date), "PPP")}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {entry.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveFunding(entry.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            No upcoming funding entries
          </p>
        )}

        <Button
          onClick={onAddFunding}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Add One-time Funding
        </Button>
      </CardContent>
    </Card>
  );
};
