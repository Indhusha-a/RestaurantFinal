import { useState } from "react";

import Step1Basic from "./Step1Basic";
import Step2Uploads from "./Step2Uploads";
import Step3Specialties from "./Step3Specialties";
import Step4Review from "./Step4Review";

export default function RestaurantRegister() {
  const [step, setStep] = useState(1);
  const stepMeta = [
    { label: "Basic", description: "Restaurant identity and secure login details" },
    { label: "Uploads", description: "Menu, images, and map link" },
    { label: "Preferences", description: "Specialties, desserts, and vibe tags" },
    { label: "Review", description: "Final check before submission" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    locationLink: "",
    budgetRange: "",
    image1: null,
    image2: null,
    menu: null,
    tags: [],
    desserts: [],
    specialties: [],
  });

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 p-6">
      <div className="mx-auto mb-10 max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">Restaurant Partner Onboarding</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">Restaurant Registration</h1>
            <p className="mt-3 max-w-2xl text-gray-600">
              Register your restaurant, upload your showcase assets, choose your specialties, and send the application forward in one guided flow.
            </p>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-400">Current Step</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {step}. {stepMeta[step - 1].label}
            </p>
            <p className="mt-2 text-sm text-slate-500">{stepMeta[step - 1].description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex justify-between text-sm mb-2">
          {stepMeta.map((item, index) => (
            <span
              key={item.label}
              className={index + 1 === step ? "font-semibold text-slate-900" : "text-slate-500"}
            >
              {item.label}
            </span>
          ))}
        </div>

        <div className="w-full h-2 bg-gray-300 rounded-full">
          <div
            className="h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all"
            style={{ width: `${step * 25}%` }}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        {step === 1 && (
          <Step1Basic formData={formData} setFormData={setFormData} next={nextStep} />
        )}

        {step === 2 && (
          <Step2Uploads
            formData={formData}
            setFormData={setFormData}
            next={nextStep}
            back={prevStep}
          />
        )}

        {step === 3 && (
          <Step3Specialties
            formData={formData}
            setFormData={setFormData}
            next={nextStep}
            back={prevStep}
          />
        )}

        {step === 4 && (
          <Step4Review
            formData={formData}
            back={prevStep}
          />
        )}
      </div>
    </div>
  );
}
