import { Lock, Mail, Store } from "lucide-react";
import { SellerFormData } from "../types";

export const SellerStepOne = ({
  formData,
  setFormData,
  errors
}: {
  formData: SellerFormData;
  setFormData: React.Dispatch<React.SetStateAction<SellerFormData>>;
  errors: Record<string, string>
}) => {
  return (
    <form className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Аккаунт
      </h3>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 ml-1">
          Эл. почта
        </label>
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Mail width={18} height={18} />
          </span>
          <input
            type="email"
            placeholder="john@example.com"
            value={formData?.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 block p-2.5 pl-10 outline-none transition-all"
          />
        </div>
        {errors && errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 ml-1">
          Пароль
        </label>
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Lock width={18} height={18} />
          </span>
          <input
            type="password"
            placeholder="Create a password"
            value={formData?.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 block p-2.5 pl-10 outline-none transition-all"
            required
          />
        </div>
         {errors && errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
      </div>
    </form>
  );
};
