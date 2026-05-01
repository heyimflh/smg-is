import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" }
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
