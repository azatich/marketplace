"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: any;
  label: string;
}

export const InputField = ({ 
  icon: Icon, 
  label, 
  type = "text", // Значение по умолчанию
  ...props 
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Если передан тип "password", то реальный тип зависит от стейта showPassword
  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <label className="text-sm text-[#A0AEC0]">{label}</label>
      <div className="relative">
        {/* Иконка слева */}
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
        
        <input
          {...props}
          type={inputType}
          className={`w-full h-12 pl-12 mt-2 ${isPasswordType ? 'pr-12' : 'pr-4'} bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#8B7FFF]/50 focus:border-[#8B7FFF]/50 transition-all disabled:opacity-50`}
        />

        {/* Кнопка "глаз" справа, только для паролей */}
        {isPasswordType && (
          <button
            type="button" // Важно! Чтобы кнопка не отправляла форму
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-white transition-colors cursor-pointer focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};