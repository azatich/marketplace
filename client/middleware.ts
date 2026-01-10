import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const roleBasedRoutes = {
  client: "/home",
  seller: "/seller/dashboard",
  admin: "/admin/clients",
};

const publicRoutes = ["/signup", "/signup-seller", "/login"];

const protectedRoutes = {
  "/seller": ["seller"],
  "/admin/clients": ["admin"],
  '/home': ['client'],
};

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET as string
    );
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; role: "client" | "seller" | "admin" };
  } catch (error) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );    

  if (!token) {
    if (isPublicRoute) {
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

  if (isPublicRoute) {
    const homeRoute = roleBasedRoutes[user.role];
    return NextResponse.redirect(new URL(homeRoute, req.url));
  }

  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|unauthorized).*)"],
};
