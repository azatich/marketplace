"use client";

import { useSignUpSeller } from "@/features/auth/api/useSignUpSeller";
import SellerStepFour from "@/features/auth/ui/SellerStepFour";
import SellerStepOne from "@/features/auth/ui/SellerStepOne";
import SellerStepThree from "@/features/auth/ui/SellerStepThree";
import SellerStepTwo from "@/features/auth/ui/SellerStepTwo";
import { AxiosError } from "axios";
import { Send, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

const SignUpSellerPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    storeName: "",
    description: "",
    category: "",
    sellerFirstName: "",
    sellerLastName: "",
    phone: "",
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate, isPending, error: signupError } = useSignUpSeller();
  const router = useRouter();

  const steps = [
    <SellerStepOne
      formData={formData}
      setFormData={setFormData}
      errors={errors}
    />,
    <SellerStepTwo
      formData={formData}
      setFormData={setFormData}
      errors={errors}
    />,
    <SellerStepThree
      formData={formData}
      setFormData={setFormData}
      errors={errors}
    />,
    <SellerStepFour formData={formData} />,
  ];

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0:
        if (!formData.email) newErrors.email = "Обязательное поле";
        if (!formData.password) newErrors.password = "Обязательное поле";
        if (formData.password.length < 6)
          newErrors.password = "Минимум 6 символов";
        break;
      case 1:
        if (!formData.storeName) newErrors.storeName = "Обязательное поле";
        if (!formData.description) newErrors.description = "Обязательное поле";
        if (!formData.category) newErrors.category = "Обязательное поле";
        break;
      case 2:
        if (!formData.sellerFirstName)
          newErrors.sellerFirstName = "Обязательное поле";
        if (!formData.sellerLastName)
          newErrors.sellerLastName = "Обязательное поле";
        if (!formData.phone) newErrors.phone = "Обязательное поле";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      mutate(formData, {
        onSuccess: () => {
          toast.success("Заявка отправлена!", {
            description: "Вы получите уведомление о статусе заявки",
            duration: 4000,
            style: {
              background: "#10b981",
              color: "#ffffff",
              border: "1px solid #059669",
              borderRadius: "8px",
              padding: "16px",
            },
            className: "toast-success",
          });

          console.log("Данные формы:", formData);
          setFormData({
            email: "",
            password: "",
            storeName: "",
            description: "",
            category: "",
            sellerFirstName: "",
            sellerLastName: "",
            phone: "",
          });
          setCurrentStep(0);
          router.push('/')
        },
        onError: (err) => {
          console.log(err);

          const errorMessage =
            err instanceof AxiosError
              ? err.response?.data?.message || "Произошла ошибка на сервере"
              : "Произошла непредвиденная ошибка. Попробуйте позже";

          toast.error("Ошибка при регистрации!", {
            description: errorMessage,
            duration: 5000,
            style: {
              background: "#ef4444",
              color: "#ffffff",
              border: "1px solid #dc2626",
              borderRadius: "8px",
              padding: "16px",
            },
            className: "toast-error",
          });
        },
      });
    }
  };

  return (
    <div className="max-w-[600px] border p-8 rounded-xl bg-white">
      <div className="border-b border-slate-100 mb-6">
        <div className="">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
              <Store className="text-indigo-600" />
              Регистрация
            </h2>
            <div className="text-right">
              <span
                className="text-xs font-semibold text-indigo-600"
                id="step-indicator-text"
              >
                Шаг {currentStep + 1} из 4
              </span>
            </div>
          </div>
          <div className="my-4">
            <p className="text-slate-500 text-xs">
              Заполните свой профиль, чтобы начать продажи по всему миру.
            </p>
          </div>
        </div>

        <div className="relative w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            id="progress-bar"
            className="absolute left-0 top-0 h-full bg-indigo-600 transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep + 1) * 100) / 4}%` }}
          ></div>
        </div>

        <div className="flex justify-between mt-2 px-1">
          <span
            className={`text-[14px] font-medium transition-colors ${
              currentStep === 0 ? "text-indigo-500" : "text-slate-400"
            }`}
            id="label-1"
          >
            Аккаунт
          </span>
          <span
            className={`text-[14px] font-medium transition-colors ${
              currentStep === 1 ? "text-indigo-500" : "text-slate-400"
            }`}
            id="label-2"
          >
            Магазин
          </span>
          <span
            className={`text-[14px] font-medium transition-colors ${
              currentStep === 2 ? "text-indigo-500" : "text-slate-400"
            }`}
            id="label-3"
          >
            Детали
          </span>
          <span
            className={`text-[14px] font-medium transition-colors ${
              currentStep === 3 ? "text-indigo-500" : "text-slate-400"
            }`}
            id="label-4"
          >
            Обзор
          </span>
        </div>
      </div>

      {steps[currentStep]}

      <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-50">
        {currentStep === 0 ? (
          <div></div>
        ) : (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="group flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all hover:shadow-lg shadow-md"
          >
            Назад
          </button>
        )}
        {currentStep === 3 ? (
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="disabled:opacity-50 group items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-indigo-500 transition-all hover:shadow-lg shadow-indigo-500/30 shadow-md flex"
          >
            <span>Подать заявку</span> <Send width={15} height={15} />
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="group flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all hover:shadow-lg shadow-md"
          >
            Далее
          </button>
        )}
      </div>
    </div>
  );
};

export default SignUpSellerPage;
