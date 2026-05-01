import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const activity = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        items: { include: { item: { select: { name: true } } } }
      }
    });
    
    return NextResponse.json({ activity });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
