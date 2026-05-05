"use client";

import { useState, useEffect } from "react";

interface Props {
  orderId: string;
  createdAt: string;
  status: string;
}

interface Step {
  label: string;
  emoji: string;
  description: string;
  thresholdMinutes: number;
}

const STEPS: Step[] = [
  {
    label: "Order Placed",
    emoji: "📦",
    description: "Your order has been received",
    thresholdMinutes: 0,
  },
  {
    label: "Processing",
    emoji: "⚙️",
    description: "We are packing your items",
    thresholdMinutes: 20,
  },
  {
    label: "Out for Delivery",
    emoji: "🚚",
    description: "Your order is on its way",
    thresholdMinutes: 60,
  },
  {
    label: "On the Way",
    emoji: "🛵",
    description: "Rider is nearby — almost there!",
    thresholdMinutes: 150,
  },
  {
    label: "Delivered",
    emoji: "✅",
    description: "Your order has been delivered. Enjoy!",
    thresholdMinutes: 210,
  },
];

function getCurrentStep(createdAt: string, status: string): number {
  if (status === "CANCELLED") return -1;
  if (status === "DELIVERED") return STEPS.length - 1;

  const elapsed = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60); // minutes
  let step = 0;
  for (let i = 0; i < STEPS.length; i++) {
    if (elapsed >= STEPS[i].thresholdMinutes) step = i;
  }
  return step;
}

function getProgress(createdAt: string, status: string): number {
  if (status === "DELIVERED") return 100;
  if (status === "CANCELLED") return 0;

  const elapsed = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
  const maxMinutes = 300; // 5 hours
  return Math.min(100, Math.round((elapsed / maxMinutes) * 100));
}

function getETA(createdAt: string): string {
  const placed = new Date(createdAt).getTime();
  const etaMin = new Date(placed + 2 * 60 * 60 * 1000);
  const etaMax = new Date(placed + 5 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(etaMin)} – ${fmt(etaMax)}`;
}

export default function LiveDeliveryTracker({
  orderId,
  createdAt,
  status,
}: Props) {
  const [currentStep, setCurrentStep] = useState(() =>
    getCurrentStep(createdAt, status),
  );
  const [progress, setProgress] = useState(() =>
    getProgress(createdAt, status),
  );
  const [now, setNow] = useState(new Date());

  // Auto-refresh every 30 seconds so progress updates live
  useEffect(() => {
    if (status === "DELIVERED" || status === "CANCELLED") return;
    const interval = setInterval(() => {
      setCurrentStep(getCurrentStep(createdAt, status));
      setProgress(getProgress(createdAt, status));
      setNow(new Date());
    }, 30_000);
    return () => clearInterval(interval);
  }, [createdAt, status]);

  const isDelivered = currentStep === STEPS.length - 1;
  const isCancelled = status === "CANCELLED";

  return (
    <div
      className="bg-white border rounded-2xl p-6 mb-4"
      style={{ borderColor: "rgba(45,80,22,0.1)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base font-semibold">
          Delivery Status
        </h2>
        {!isCancelled && !isDelivered && (
          <span className="text-xs" style={{ color: "#8A9480" }}>
            ETA: {getETA(createdAt)}
          </span>
        )}
      </div>

      {isCancelled ? (
        <div
          className="text-center py-6 rounded-xl"
          style={{ backgroundColor: "#F9EDE8" }}
        >
          <div className="text-3xl mb-2">❌</div>
          <p className="font-medium" style={{ color: "#C8593A" }}>
            Order Cancelled
          </p>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div
            className="h-2 rounded-full mb-6"
            style={{ backgroundColor: "#F2F7EC" }}
          >
            <div
              className="h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${progress}%`,
                backgroundColor: isDelivered ? "#2D5016" : "#4A7C28",
              }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              const pending = i > currentStep;
              return (
                <div key={step.label} className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all"
                    style={{
                      backgroundColor:
                        done || active
                          ? done
                            ? "#C8DFB0"
                            : "#2D5016"
                          : "#FAF7F2",
                      opacity: pending ? 0.4 : 1,
                    }}
                  >
                    {done ? "✓" : step.emoji}
                  </div>
                  <div className="pt-1.5">
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: active
                          ? "#2D5016"
                          : done
                            ? "#4A7C28"
                            : "#8A9480",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {step.label}
                      {active && (
                        <span
                          className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-normal"
                          style={{
                            backgroundColor: "#C8DFB0",
                            color: "#2D5016",
                          }}
                        >
                          Current
                        </span>
                      )}
                    </p>
                    {(active || done) && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#8A9480" }}
                      >
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isDelivered && (
            <div
              className="mt-4 rounded-xl p-4 text-center"
              style={{ backgroundColor: "#C8DFB0" }}
            >
              <p className="font-semibold" style={{ color: "#2D5016" }}>
                🎉 Delivery Complete! Thank you for your order.
              </p>
            </div>
          )}

          {!isDelivered && (
            <p
              className="text-[10px] text-center mt-4"
              style={{ color: "#8A9480" }}
            >
              Updates every 30 seconds · Last checked {now.toLocaleTimeString()}
            </p>
          )}
        </>
      )}
    </div>
  );
}
