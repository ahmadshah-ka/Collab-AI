import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

function normalizeRoute(value: string | undefined, fallback: string) {
  const trimmedValue = value?.trim()

  if (!trimmedValue) {
    return fallback
  }

  const normalizedValue = trimmedValue.startsWith("/") ? trimmedValue : `/${trimmedValue}`
  return normalizedValue === "/" ? "/" : normalizedValue.replace(/\/+$/, "")
}

function toRouteMatchers(route: string) {
  if (route === "/") {
    return ["/", "/:path*"]
  }

  return [route, `${route}/:path*`]
}

const isPublicRoute = createRouteMatcher([
  ...toRouteMatchers(normalizeRoute(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL, "/sign-in")),
  ...toRouteMatchers(normalizeRoute(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL, "/sign-up")),
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
