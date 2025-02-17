
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface AssetLiability {
  [key: string]: number;
}

export const NetWorthCalculator = () => {
  const [assets, setAssets] = useState<AssetLiability>({
    cash: 0,
    investments: 0,
    realEstate: 0,
    vehicles: 0,
    otherAssets: 0,
  });

  const [liabilities, setLiabilities] = useState<AssetLiability>({
    mortgages: 0,
    carLoans: 0,
    studentLoans: 0,
    creditCardDebt: 0,
    otherDebts: 0,
  });

  const [result, setResult] = useState<{
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  } | null>(null);

  const handleAssetChange = (key: string, value: number) => {
    setAssets(prev => ({ ...prev, [key]: value }));
  };

  const handleLiabilityChange = (key: string, value: number) => {
    setLiabilities(prev => ({ ...prev, [key]: value }));
  };

  const calculateNetWorth = () => {
    const totalAssets = Object.values(assets).reduce((sum, value) => sum + value, 0);
    const totalLiabilities = Object.values(liabilities).reduce((sum, value) => sum + value, 0);
    const netWorth = totalAssets - totalLiabilities;

    setResult({
      totalAssets,
      totalLiabilities,
      netWorth,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assets</h3>
            {Object.entries(assets).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()} ($)
                </Label>
                <Input
                  id={key}
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => handleAssetChange(key, Number(e.target.value))}
                  placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} value`}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liabilities</h3>
            {Object.entries(liabilities).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()} ($)
                </Label>
                <Input
                  id={key}
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => handleLiabilityChange(key, Number(e.target.value))}
                  placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} amount`}
                />
              </div>
            ))}
          </div>

          <Button onClick={calculateNetWorth} className="w-full">
            Calculate Net Worth
          </Button>
        </div>

        <div className="space-y-4">
          {result && (
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-6 bg-primary/5">
                <h3 className="text-lg font-semibold mb-2">Net Worth Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Assets</p>
                    <p className="text-xl font-semibold text-green-600">
                      ${result.totalAssets.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Liabilities</p>
                    <p className="text-xl font-semibold text-red-600">
                      ${result.totalLiabilities.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Net Worth</p>
                    <p className={`text-2xl font-bold ${result.netWorth >= 0 ? 'text-primary' : 'text-red-600'}`}>
                      ${result.netWorth.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
