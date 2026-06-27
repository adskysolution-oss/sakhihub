'use client';

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface UserJourneyStepperProps {
  user: any;
}

export default function UserJourneyStepper({ user }: UserJourneyStepperProps) {
  if (!user) return null;

  // Journey steps evaluation
  const steps = [
    { label: 'Registered', completed: true },
    { 
      label: 'Docs Submitted', 
      completed: user.onboardingCompleted || user.documentsVerified || user.paymentCompleted 
    },
    { 
      label: 'Docs Verified', 
      completed: user.documentsVerified === true 
    },
    { 
      label: 'Payment Completed', 
      completed: user.paymentCompleted === true 
    },
    { 
      label: 'Mapping Completed', 
      completed: ['super_admin', 'operations_admin', 'staff', 'vendor', 'member'].includes(user.role) || user.assignmentStatus === 'completed'
    },
    { 
      label: 'Account Active', 
      completed: ['active', 'approved'].includes(user.status) 
    }
  ];

  return (
    <div className="w-full bg-slate-50 p-6 rounded-2xl border border-gray-100 mb-6">
      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
        User Onboarding Journey
      </h4>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const isCompleted = step.completed;
          const isNextPending = !isCompleted && (idx === 0 || steps[idx - 1].completed);

          return (
            <div key={idx} className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-2">
              {/* Step Circle & Label */}
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                  ) : isNextPending ? (
                    <Circle className="text-primary w-5 h-5 animate-pulse" strokeWidth={3} />
                  ) : (
                    <Circle className="text-gray-300 w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${
                    isCompleted ? 'text-green-600' : isNextPending ? 'text-primary' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
              </div>

              {/* Connecting Line (Desktop) */}
              {!isLast && (
                <div className="hidden md:block flex-1 h-0.5 mx-2 bg-gray-200">
                  <div className={`h-full ${isCompleted ? 'bg-green-500 w-full' : 'bg-transparent w-0'} transition-all`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
