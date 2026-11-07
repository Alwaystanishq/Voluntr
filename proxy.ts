import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/user/login",
  },
});

export const config = {
  matcher: [
    "/explore",
    "/explore/:path*",
    "/dashboard",
    "/profile",
    "/admin/:path*",
    "/volunteer/:path*",
    "/create-event",
  ],
};