import { OrderStatus } from '@/data/types';
import { Package, Truck, CheckCircle } from 'lucide-react';

const steps: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'Preparing', label: 'Preparing', icon: Package },
  { status: 'In Transit', label: 'In Transit', icon: Truck },
  { status: 'Delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderStepper({ current }: { current: OrderStatus }) {
  const currentIdx = steps.findIndex((s) => s.status === current);

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={step.status} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive
                    ? 'bg-primary/20 text-primary glow-border'
                    : 'bg-muted/30 text-muted-foreground border border-border'
                } ${isCurrent ? 'animate-pulse-glow' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mx-2">
                <div className={`h-0.5 rounded-full transition-all duration-500 ${i < currentIdx ? 'bg-primary' : 'bg-border'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
