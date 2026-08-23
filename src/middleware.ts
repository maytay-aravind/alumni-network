import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedRoutes = ["/student", "/alumni", "/admin"];
const authRoutes = ["/login", "/register", "/forgot-password"];

const roleRouteMap: Record<string, string[]> = {
  student: ["/student"],
  alumni: ["/alumni"],
  admin: ["/admin"],
};

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request);

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return Response.redirect(url);
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    const userRole = user.user_metadata?.role || "student";

    switch (userRole) {
      case "admin":
        url.pathname = "/admin";
        break;
      case "alumni":
        url.pathname = "/alumni";
        break;
      default:
        url.pathname = "/student";
        break;
    }
    return Response.redirect(url);
  }

  if (user && isProtectedRoute) {
    const userRole = user.user_metadata?.role || "student";
    const allowedPrefixes = roleRouteMap[userRole] || [];

    const isAllowed = allowedPrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (!isAllowed) {
      const url = request.nextUrl.clone();

      if (userRole === "admin") {
        url.pathname = "/admin";
      } else if (userRole === "alumni") {
        url.pathname = "/alumni";
      } else {
        url.pathname = "/student";
      }
      return Response.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
