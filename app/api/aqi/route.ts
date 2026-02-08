import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=pm10,pm2_5,nitrogen_dioxide,ozone&timezone=auto`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Bad AQ response");
    const data = await res.json();
    const { hourly } = data;
    const lastIdx = hourly.time.length - 1;
    const payload = {
      time: hourly.time[lastIdx],
      pm10: hourly.pm10[lastIdx],
      pm2_5: hourly.pm2_5[lastIdx],
      nitrogen_dioxide: hourly.nitrogen_dioxide[lastIdx],
      ozone: hourly.ozone[lastIdx]
    };
    return NextResponse.json(payload, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "AQ fetch failed" }, { status: 500 });
  }
}
