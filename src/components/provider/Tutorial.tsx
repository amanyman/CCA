import { useState } from 'react';
import {
  X,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Search,
  Settings,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  content: React.ReactNode;
}

const steps: TutorialStep[] = [
  {
    title: 'Welcome to the Partner Portal',
    icon: LayoutDashboard,
    iconBg: 'bg-blue-100 text-blue-900',
    content: (
      <div className="space-y-3 text-slate-600">
        <p>
          Thank you for partnering with California Care Alliance! This portal is
          your central hub for managing client referrals.
        </p>
        <p>Here's what you can do:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Submit new referrals for clients who need services</li>
          <li>Track the status of all your submitted referrals</li>
          <li>View detailed information on each referral</li>
          <li>Keep your agency profile up to date</li>
        </ul>
        <p className="text-sm">
          Let's walk through each section so you can get started quickly.
        </p>
      </div>
    ),
  },
  {
    title: 'Your Dashboard',
    icon: LayoutDashboard,
    iconBg: 'bg-blue-100 text-blue-900',
    content: (
      <div className="space-y-3 text-slate-600">
        <p>
          The Dashboard is your home base. It gives you a quick overview of your
          referral activity at a glance.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>Stat cards</strong> show your total referrals, how many are
            pending, accepted, and in progress
          </li>
          <li>
            <strong>Recent Referrals</strong> lists your latest submissions so
            you can quickly check their status
          </li>
          <li>
            Use the <strong>"Submit New Referral"</strong> button to jump
            straight into creating a referral
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Submit a Referral',
    icon: PlusCircle,
    iconBg: 'bg-green-100 text-green-800',
    content: (
      <div className="space-y-3 text-slate-600">
        <p>
          Submitting a referral is the core action in the portal. Navigate to{' '}
          <strong>Referrals</strong> in the sidebar and click{' '}
          <strong>"New Referral"</strong>.
        </p>
        <p className="text-sm">You'll fill out details including:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Client's personal information (name, date of birth, contact)</li>
          <li>Service type and urgency level</li>
          <li>Reason for referral and any relevant notes</li>
        </ul>
        <p className="text-sm">
          Once submitted, CCA staff will review the referral and update its
          status. You'll be able to track every step from your dashboard.
        </p>
      </div>
    ),
  },
  {
    title: 'Track Your Referrals',
    icon: Search,
    iconBg: 'bg-yellow-100 text-yellow-800',
    content: (
      <div className="space-y-3 text-slate-600">
        <p>
          The <strong>Referrals</strong> page shows all referrals you've
          submitted, with powerful tools to find what you need.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>Search</strong> by client name to quickly find a specific
            referral
          </li>
          <li>
            <strong>Filter by status</strong> (Pending, Accepted, In Progress,
            etc.) to focus on what matters
          </li>
          <li>
            Click any referral to see its <strong>full details</strong>,
            including status history and notes from CCA staff
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Agency Profile',
    icon: Settings,
    iconBg: 'bg-slate-100 text-slate-800',
    content: (
      <div className="space-y-3 text-slate-600">
        <p>
          Keep your agency information current by visiting the{' '}
          <strong>Agency Profile</strong> page in the sidebar.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Update your agency name, address, and contact details</li>
          <li>Ensure your main contact information is accurate</li>
          <li>Changes are saved immediately when you submit the form</li>
        </ul>
        <p className="text-sm">
          Accurate profile information helps CCA staff coordinate with you
          efficiently.
        </p>
      </div>
    ),
  },
];

export function Tutorial({ isOpen, onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleClose = () => {
    localStorage.setItem('cca_tutorial_seen', 'true');
    setCurrentStep(0);
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => s - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50">
      <div className="bg-white rounded-xl shadow-xl mx-4 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${step.iconBg} rounded-lg flex items-center justify-center`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              {step.title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">{step.content}</div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          {/* Step Indicator */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep ? 'bg-blue-900' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-950 transition-colors"
            >
              {isLast ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
