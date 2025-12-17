import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    NEXT_PUBLIC_MAINTENANCE_MODE: process.env.NEXT_PUBLIC_MAINTENANCE_MODE,
    deployed: true,
  });
}
