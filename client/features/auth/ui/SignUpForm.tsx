"use client";

import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSignUp } from "../api/useSignUp";

export const SignUpForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const router = useRouter();
  const { mutate, isPending, error } = useSignUp();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    try {
      mutate(formData, {
        onSuccess: () => {
          toast.success("Успешная авторизация!", {
            description: "Вы теперь можете видеть товары и заказы",
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
          router.push("/");
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
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-[400px] border p-8 rounded-xl bg-white">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Создать аккаунт
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Присоединяйтесь к маркетплейс, чтобы приобретать товары и отслеживать
          заказы.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 ml-1">
              First name
            </label>
            <input
              type="text"
              placeholder="John"
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 block p-2.5 outline-none transition-all"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 ml-1">
              Last name
            </label>
            <input
              type="text"
              placeholder="Doe"
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 block p-2.5 outline-none transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 ml-1">
            Email
          </label>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Mail width={18} height={18} />
            </span>
            <input
              type="email"
              placeholder="john@example.com"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 block p-2.5 pl-10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 ml-1">
            Password
          </label>
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Lock width={18} height={18} />
            </span>
            <input
              type="password"
              placeholder="Create a password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 block p-2.5 pl-10 outline-none transition-all"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-200 text-red-900 p-2.5 rounded-xl text-sm">
            {error instanceof AxiosError
              ? error.response?.data.message
              : "Произашла ошибка"}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="disabled:opacity-50 w-full group relative flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform hover:scale-[1.01]"
          >
            Создать аккаунт
          </button>
        </div>
      </form>
    </div>
  );
};
