import { analyzePayload } from "@/services/scanAnalysis";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  return Response.json(analyzePayload(payload as any));
}
