import React from 'react'
import { SellerFormData } from '../types';

const SellerStepThree = ({
  formData,
  setFormData,
  errors
}: {
  formData: SellerFormData,
  setFormData: React.Dispatch<React.SetStateAction<SellerFormData>>;
  errors: Record<string, string>
}) => {
  return (
     <form className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
        Сведение о владельце
      </h3>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 ml-1">
          Имя
        </label>
        <div className="relative group">
          <input
            type="sellerFirstName"
            placeholder=""
            value={formData?.sellerFirstName}
            onChange={(e) =>
              setFormData({ ...formData, sellerFirstName:e.target.value })
            }
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 block p-2.5 outline-none transition-all"
          />
        </div>
        {errors && errors.sellerFirstName && <span className="text-red-500 text-sm">{errors.sellerFirstName}</span>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 ml-1">
          Фамилия
        </label>
        <div className="relative group">
          <input
            type="sellerLastName"
            placeholder=""
            value={formData?.sellerLastName}
            onChange={(e) =>
              setFormData({ ...formData, sellerLastName:e.target.value })
            }
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 block p-2.5 outline-none transition-all"
          />
        </div>
        {errors && errors.sellerLastName && <span className="text-red-500 text-sm">{errors.sellerLastName}</span>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 ml-1">
          Телефон
        </label>
        <div className="relative group">
          <input
            type="phone"
            placeholder="+7 ***"
            value={formData?.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 block p-2.5 outline-none transition-all"
            required
          />
        </div>
        {errors && errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
      </div>
    </form>
  )
}

export default SellerStepThree