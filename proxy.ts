import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Barreira grosseira: sem cookie de sessão, vai para o login.
// A verificação real (assinatura, papel, posse do registro) acontece em lib/dal.ts.
export function proxy(request: NextRequest) {
  if (!request.cookies.get("vp_session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/vet/:path*", "/tutor/:path*"],
};
