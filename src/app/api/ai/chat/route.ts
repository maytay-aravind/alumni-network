import { NextRequest, NextResponse } from "next/server";
import { careerChat } from "@/lib/ai/gemini";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message too long. Maximum 2000 characters." },
        { status: 400 }
      );
    }

    let parsedContext: ChatMessage[] | undefined;
    if (context && Array.isArray(context)) {
      parsedContext = context.slice(-10).map((c: any) => ({
        role: c.role,
        content: c.content,
      }));
    }

    const response = await careerChat(message, parsedContext);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate response. Please try again.",
        fallback:
          "I'm having trouble connecting to my AI services right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
