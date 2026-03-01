import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const roleBasedHomes = {
  client: "/catalog",
  seller: "/seller/dashboard",
  admin: "/admin/clients",
};

const publicRoutes = ["/"];

const authRoutes = ["/signup", "/signup-seller", "/login"];

const protectedZones = {
  admin: ["/admin"], 
  seller: ["/seller/dashboard", "seller/products", "/seller/orders", "seller/settings", "seller/chats"],
  client: ["/cart", "/orders", "/profile", '/catalog'],
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
  const isPublicRoute = publicRoutes.includes(pathname);

  if (!token) {
    if (isAuthRoute || isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }


  const user = await verifyToken(token);

  if (!user) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }

  const role = user.role;
  const homeRoute = roleBasedHomes[role];

  if (isAuthRoute) {
    return NextResponse.redirect(new URL(homeRoute, req.url));
  }

  const isAdminZone = protectedZones.admin.some((r) => pathname.startsWith(r));
  if (isAdminZone && role !== "admin") {
    return NextResponse.redirect(new URL(homeRoute, req.url));
  }

  const isSellerZone = protectedZones.seller.some((r) => pathname.startsWith(r));
  if (isSellerZone && role !== "seller") {
    return NextResponse.redirect(new URL(homeRoute, req.url));
  }

  const isClientZone = protectedZones.client.some((r) => pathname.startsWith(r));
  if (isClientZone && role !== "client") {
    return NextResponse.redirect(new URL(homeRoute, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};