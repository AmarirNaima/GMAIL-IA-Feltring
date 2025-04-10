// app/api/filters/route.ts

import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { updateUserFilterSettings } from "@/lib/filter-settings";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = await getToken({
      req: { headers: { cookie: cookieStore.toString() } } as any,
    });

    if (!token?.accessToken) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    const requiredKeys = ["spamThreshold", "allowPromotions"];
    for (const key of requiredKeys) {
      if (!(key in body)) {
        return new Response(`Missing "${key}" in request body`, { status: 400 });
      }
    }

    // Update settings
    const result = await updateUserFilterSettings(token.accessToken, {
      spamThreshold: body.spamThreshold,
      allowPromotions: body.allowPromotions,
    });

    return Response.json({ success: true, ...result });
  } catch (err) {
    console.error("Error in POST /api/filters:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
