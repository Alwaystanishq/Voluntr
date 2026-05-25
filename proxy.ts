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
    "/create-event",
    "/edit-event/:path*",
  ],
};