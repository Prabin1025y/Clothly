import { Check } from 'lucide-react'

interface Step {
    id: number
    label: string
}

interface ProgressBarProps {
    currentStep: number
    steps: Step[]
}

export default function CheckoutProgressBar({ currentStep, steps }: ProgressBarProps) {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between relative">
                {/* Background connector line */}
                <div className="absolute top-6 left-6 right-4 h-0.5 bg-gray-200" style={{ zIndex: 0 }} />

                {/* Active progress line */}
                <div
                    className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-500 ease-out"
                    style={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 90}%`,
                        zIndex: 1
                    }}
                />

                {steps.map((step) => {
                    const isCompleted = currentStep > step.id
                    const isCurrent = currentStep === step.id
                    // const isPending = currentStep < step.id

                    return (
                        <div key={step.id} className="flex flex-col items-center relative" style={{ zIndex: 2 }}>
                            {/* Step Circle */}
                            <div
                                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-semibold text-base
                  transition-all duration-300 ease-out transform
                  ${isCompleted
                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-100'
                                        : isCurrent
                                            ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/40 scale-110 ring-4 ring-amber-100'
                                            : 'bg-white text-gray-400 border-2 border-gray-200 scale-100'
                                    }
                `}
                            >
                                {isCompleted ? (
                                    <Check className="w-6 h-6" strokeWidth={3} />
                                ) : (
                                    step.id
                                )}
                            </div>

                            {/* Step Label */}
                            <span
                                className={`
                  text-sm font-medium mt-3 text-center whitespace-nowrap transition-colors duration-300
                  ${isCurrent
                                        ? 'text-amber-600 font-semibold'
                                        : isCompleted
                                            ? 'text-gray-700'
                                            : 'text-gray-400'
                                    }
                `}
                            >
                                {step.label}
                            </span>

                            {/* Status indicator text */}
                            {isCurrent && (
                                <span className="text-xs text-amber-500 mt-1 font-medium absolute -bottom-5">In Progress</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}