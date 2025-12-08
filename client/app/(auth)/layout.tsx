'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const navLinks = [
    {
      id: 1,
      link: "/login",
      label: "Логин",
    },
    {
      id: 2,
      link: "/signup",
      label: "Регистрация",
    },
    {
      id: 3,
      link: "/signup-seller",
      label: "Бизнес",
    },
  ];
  return (
    <div className="flex justify-center items-center h-svh bg-gray-100">
      <div className=" fixed top-10 bg-white/80 backdrop-blur-md shadow-lg shadow-slate-200/50 rounded-full p-1 flex gap-1 border border-white/50">
        {navLinks.map((link) => {
          const isActive = pathname === link.link
          return (
            <Link
              className={` 
                ${isActive && 'bg-slate-900 text-white '}
                px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300`}
              href={link.link}
              key={link.id}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;
