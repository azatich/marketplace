"use client";

import React from "react";

type Props = {
  open: boolean;
  message: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationPopUp = ({
  open,
  message,
  title = "Подтверждение",
  confirmText = "Да, удалить",
  cancelText = "Отмена",
  isLoading = false,
  onConfirm,
  onCancel,
}: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-[#1A1F2E] p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white">{title}</h3>

        <p className="mt-2 text-sm text-white">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-slate-200 text-white hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isLoading ? "Удаление..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopUp;
