import { ShoppingCart } from "lucide-react";
import React from "react";
import { SellerFormData } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SellerStepTwo = ({
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
        Информация о магазине
      </h3>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 ml-1">
          Название магазина
        </label>
        <div className="relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <ShoppingCart widths={18} height={18} />
          </span>
          <input
            type="name"
            value={formData?.storeName}
            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 block p-2.5 pl-10 outline-none transition-all"
          />
        </div>
        {errors && errors.storeName && <span className="text-red-500 text-sm">{errors.storeName}</span>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 ml-1">
          Описание
        </label>
        <div className="relative group">
          <textarea
            placeholder="Расскажите нам о вашей бизнесе"
            value={formData?.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 block p-2.5 outline-none transition-all"
            required
          />
        </div>
        {errors && errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700 ml-1">
          Категория
        </label>
        <Select
          value={formData?.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fashion">Одежды</SelectItem>
            <SelectItem value="electronics">Электроника</SelectItem>
          </SelectContent>
        </Select>
        {errors && errors.category && <span className="text-red-500 text-sm">{errors.category}</span>}
      </div>
    </form>
  );
};

export default SellerStepTwo;
