import React from "react";
import { SellerFormData } from "../types";
import { CircleCheckBig, Store } from "lucide-react";

export const SellerStepFour = ({ formData }: { formData: SellerFormData }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <div className="bg-green-50 p-3 rounded-full mt-4">
        <CircleCheckBig className="text-green-600" width={32} height={32} />
      </div>
      <div className="px-8">
        <h3 className="text-center text-xl font-semibold">Готов к отправке</h3>
        <p className="text-sm text-gray-500">
          Пожалуйста, ознакомьтесь с вашей информацией перед отправкой. Ваш
          магазин ожидает одобрения.
        </p>
      </div>
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6 text-left">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
            <Store />
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              {formData.storeName}
            </p>
            <p className="text-slate-500">{formData.category}</p>
          </div>
        </div>
        <div className="text-[12px] text-slate-400 border-t border-slate-200 pt-2 mt-2">
          {formData.description}
        </div>
      </div>
    </div>
  );
};
