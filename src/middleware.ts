import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const isAuthRoute = createRouteMatcher(["/auth(.*)"])
const isAdminRoute = createRouteMatcher(["/admin(.*)"])
const isPublicRoute = createRouteMatcher(["/api/auth-hook(.*)", "/api/trpc(.*)"])

export default clerkMiddleware(async (auth, request) => {
  if (isAuthRoute(request) || isPublicRoute(request)) return NextResponse.next()

	// if(isAdminRoute(request))

  // protect all routes
  auth().protect()

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)", "/api/auth-hook(.*)"],
};
