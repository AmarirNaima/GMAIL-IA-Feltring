// app/api/emails/route.ts

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // ✅ Make sure this points to your actual authOptions file
import { fetchEmails } from "@/lib/gmail-actions";

export async function GET(req: NextRequest) {
  try {
    // ✅ Get authenticated session
    const session = await getServerSession(authOptions);

    console.log("🧠 Session:", session);

    if (!session?.accessToken) {
      console.warn("❌ Unauthorized: Missing accessToken in session");
      return new Response("Unauthorized", { status: 401 });
    }

    // ✅ Fetch Gmail data
    const emails = await fetchEmails(session.accessToken);

    return Response.json({ emails });
  } catch (error) {
    console.error("❌ Failed to fetch emails:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
