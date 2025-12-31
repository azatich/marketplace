"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { User } from "@/features/admin/types/index";
import { createPortal } from "react-dom";

type Props = {
  user: User;
};

export function UserActions({ user }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.right - 160 + window.scrollX, // 160 = width меню
      });
    }
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded hover:bg-white/10"
      >
        <MoreHorizontal size={18} />
      </button>

      {open &&
        createPortal(
          <div
            className="absolute w-40 bg-[#1A1F2E] border border-white/10 rounded-lg shadow-xl z-[9999]"
            style={{ top: coords.top, left: coords.left }}
          >
            <button
              className="flex w-full items-center gap-2 px-4 py-2 text-white hover:bg-white/10"
              onClick={() => console.log("EDIT", user.id)}
            >
              <Pencil size={14} />
              Изменить
            </button>

            <button
              className="flex w-full items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10"
              onClick={() => console.log("DELETE", user.id)}
            >
              <Trash size={14} />
              Удалить
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
