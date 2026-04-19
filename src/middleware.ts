import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/pets(.*)",
  "/bookings(.*)",
  "/shop(.*)",
  "/events(.*)",
  "/adoption(.*)",
  "/rescue(.*)",
  "/profile(.*)",
  "/api/pets(.*)",
  "/api/bookings(.*)",
  "/api/adoption(.*)",
  "/api/rescue(.*)",
  "/api/shop(.*)",
  "/api/payments(.*)",
  "/api/notifications(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
