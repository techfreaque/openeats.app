import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return new NextResponse("Not Found", { status: 404 });
}

export function POST(): NextResponse {
  return new NextResponse("Not Found", { status: 404 });
}

export function PUT(): NextResponse {
  return new NextResponse("Not Found", { status: 404 });
}

export function DELETE(): NextResponse {
  return new NextResponse("Not Found", { status: 404 });
}

export function PATCH(): NextResponse {
  return new NextResponse("Not Found", { status: 404 });
}

export function OPTIONS(): NextResponse {
  return new NextResponse("Not Found", { status: 404 });
}
