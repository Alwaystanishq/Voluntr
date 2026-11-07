import { redirect } from "next/navigation";
import { adminSession } from "@/lib/admin";
import Navbar from "@/components/Navbar";
import OrganizationReviewQueue from "@/components/OrganizationReviewQueue";

export default async function OrganizationReviews() {
  if (!await adminSession()) redirect("/");
  return <><Navbar /><main className="min-h-screen bg-orange-50 px-6 py-10 text-gray-800"><div className="mx-auto max-w-4xl"><h1 className="mb-3 text-3xl font-bold">NGO verification reviews</h1><p className="mb-6 text-gray-600">Review the NGO’s registration evidence and website before approving. Your note is shared with the organization.</p><OrganizationReviewQueue /></div></main></>;
}
