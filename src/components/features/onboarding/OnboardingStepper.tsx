import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface UserStatus {
  role: string;
  documentsVerified: boolean;
  paymentCompleted: boolean;
  assignmentStatus: string;
  dashboardAccess: boolean;
}

interface OnboardingStepperProps {
  user: UserStatus;
}

export default function OnboardingStepper({ user }: OnboardingStepperProps) {
  if (!user) return null;

  const isVendor = user.role === 'vendor';

  // Base Steps
  let steps = [
    { id: 1, name: 'Registration', status: 'completed' },
    { 
      id: 2, 
      name: 'Verification', 
      status: user.documentsVerified ? 'completed' : 'current' 
    },
    { 
      id: 3, 
      name: 'Payment', 
      status: !user.documentsVerified ? 'upcoming' 
             : user.paymentCompleted ? 'completed' 
             : 'current' 
    }
  ];

  if (!isVendor) {
    // Sub-Vendor / Employee specific step
    steps.push({
      id: 4,
      name: 'Hierarchy Mapping',
      status: !user.paymentCompleted ? 'upcoming'
             : user.assignmentStatus === 'completed' ? 'completed'
             : 'current'
    });
    
    // Final Step
    steps.push({
      id: 5,
      name: 'Dashboard Access',
      status: user.dashboardAccess ? 'completed' : 'upcoming'
    });
  } else {
    // Vendor Final Step
    steps.push({
      id: 4,
      name: 'Dashboard Access',
      status: user.dashboardAccess ? 'completed' : 'upcoming'
    });
  }

  return (
    <div className="flex justify-between mb-16 relative">
      <div className="absolute top-[18px] left-0 w-full h-[2px] bg-gray-100 z-0"></div>
      {steps.map((step) => {
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';
        
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${
              isCompleted ? 'bg-green-500 text-white' :
              isCurrent ? 'bg-primary text-white ring-8 ring-primary/10' :
              'bg-white text-gray-300 border-2 border-gray-100'
            }`}>
              {isCompleted ? <CheckCircle2 size={18} /> : step.id}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-primary' : 'text-gray-400'}`}>
              {step.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
