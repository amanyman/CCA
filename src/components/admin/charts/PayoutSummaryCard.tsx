import { DollarSign } from 'lucide-react';

interface PayoutSummaryCardProps {
  totalCosts: number;
  totalPaid: number;
  totalPending: number;
}

export function PayoutSummaryCard({ totalCosts, totalPaid, totalPending }: PayoutSummaryCardProps) {
  const paidPercent = totalCosts > 0 ? Math.round((totalPaid / totalCosts) * 100) : 0;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold text-slate-800">Payout Summary</h3>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Total Costs</span>
          <span className="font-semibold text-slate-800">{formatCurrency(totalCosts)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Paid</span>
          <span className="font-semibold text-green-700">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Pending</span>
          <span className="font-semibold text-yellow-700">{formatCurrency(totalPending)}</span>
        </div>

        {/* Progress bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Payment Progress</span>
            <span>{paidPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all"
              style={{ width: `${paidPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
