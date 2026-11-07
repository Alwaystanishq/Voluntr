import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export async function adminSession() {
  const session = await getServerSession(authOptions);
  const ids = (process.env.ADMIN_USER_IDS || "").split(",").map((id) => id.trim()).filter(Boolean);
  return session && ids.includes(session.user.id) ? session : null;
}
