import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export const middleware = clerkMiddleware(async (auth, request) => {
  const { userId, redirectToSignIn } = await auth();

  // ✅ Si la route est publique, on ne bloque pas
  if (isPublicRoute(request)) return;

  // ✅ Si on est sur "/" et non authentifié → redirige vers /sign-in
  if (request.nextUrl.pathname === "/" && !userId) {
    return redirectToSignIn({ returnBackUrl: request.url });
  }

  // ✅ Sinon, on protège les autres routes
  if (!userId) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
