import { NextResponse } from "next/server";

const prompts = [
  "Điều gì khiến bạn mệt nhất hôm nay?",
  "Điều gì đã giúp bạn đi qua ngày hôm nay?",
  "Bạn đang cần điều gì mà chưa nói ra?",
  "Nếu dịu lại 1%, bạn sẽ làm gì trước?",
  "Điều gì bạn muốn buông bỏ trước khi ngủ?",
  "Một khoảnh khắc nhỏ khiến bạn mỉm cười hôm nay?",
];

export async function GET() {
  const index = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % prompts.length;
  return NextResponse.json({ prompt: prompts[index], all: prompts });
}
