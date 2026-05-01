import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  
  if (q.length < 2) return NextResponse.json({ items: [] });

  try {
    const items = await prisma.item.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { sku: { contains: q } },
          { alias: { contains: q } },
          { category: { name: { contains: q } } }
        ]
      },
      include: { category: true },
      take: 10
    });
    
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
