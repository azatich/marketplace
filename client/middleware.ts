import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

// 1. Домашние страницы для каждой роли (куда кидать при входе или при ошибке доступа)
const roleBasedHomes = {
  client: "/catalog",
  seller: "/seller/dashboard",
  admin: "/admin/clients",
};

// 2. Страницы авторизации (доступны только БЕЗ токена)
const authRoutes = ["/signup", "/signup-seller", "/login"];

// 3. Защищенные зоны (какие пути кому принадлежат)
const protectedZones = {
  admin: ["/admin"], // Все что начинается с /admin — только для админов
  seller: ["/dashboard", "/products", "/seller", "/settings"], // Зона продавца
  client: ["/cart", "/orders", "/profile"], // Приватная зона клиента (каталог и товары оставим общими)
};

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; role: "client" | "seller" | "admin" };
  } catch (error) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // ==========================================
  // ЭТАП 1: НЕТ ТОКЕНА (НЕАВТОРИЗОВАН)
  // ==========================================
  if (!token) {
    if (isAuthRoute) {
      return NextResponse.next(); // Разрешаем зайти на /login или /signup
    }
    // Если пытается зайти куда-то еще без токена — кидаем на логин
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ==========================================
  // ЭТАП 2: ЕСТЬ ТОКЕН (ПРОВЕРЯЕМ)
  // ==========================================
  const user = await verifyToken(token);

  if (!user) {
    // Токен протух или подделан
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }

  const role = user.role;
  const homeRoute = roleBasedHomes[role];

  // ==========================================
  // ЭТАП 3: ПЕРЕНАПРАВЛЕНИЯ АВТОРИЗОВАННЫХ
  // ==========================================
  
  // Если юзер с токеном зашел на главную (/) ИЛИ на страницу авторизации (/login) -> кидаем домой
  if (pathname === "/" || isAuthRoute) {
    return NextResponse.redirect(new URL(homeRoute, req.url));
  }

  // ==========================================
  // ЭТАП 4: ЗАЩИТА РОУТОВ (ROUTING GUARD)
  // ==========================================

  // Проверка зоны Админа
  const isAdminZone = protectedZones.admin.some((r) => pathname.startsWith(r));
  if (isAdminZone && role !== "admin") {
    return NextResponse.redirect(new URL(homeRoute, req.url)); // Кидаем в его дом
  }

  // Проверка зоны Продавца
  const isSellerZone = protectedZones.seller.some((r) => pathname.startsWith(r));
  if (isSellerZone && role !== "seller") {
    return NextResponse.redirect(new URL(homeRoute, req.url));
  }

  // Проверка приватной зоны Клиента
  const isClientZone = protectedZones.client.some((r) => pathname.startsWith(r));
  if (isClientZone && role !== "client") {
    return NextResponse.redirect(new URL(homeRoute, req.url));
  }

  // Каталог (/catalog) и страница товара (/product/[id]) доступны всем авторизованным
  return NextResponse.next();
}

export const config = {
  // Исключаем статику, API и системные пути Next.js из проверок
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};