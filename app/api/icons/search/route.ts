import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term") || "business";
  const page = searchParams.get("page") || "1";
  const style = searchParams.get("style") || ""; // e.g., "lineal-color", "flat"

  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FREEPIK_API_KEY não configurada" },
      { status: 500 }
    );
  }

  try {
    let url = `https://api.freepik.com/v1/icons?term=${encodeURIComponent(term)}&per_page=30&page=${page}`;
    if (style) {
      url += `&filters[style]=${encodeURIComponent(style)}`;
    }

    const response = await fetch(url, {
      headers: {
        "x-freepik-api-key": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Freepik API error:", errorText);
      return NextResponse.json(
        { error: "Erro ao buscar ícones" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Simplify response for frontend
    const icons = (data.data || []).map(
      (icon: {
        id: number;
        name: string;
        thumbnails: { url: string }[];
        style: { name: string };
        family: { name: string };
      }) => ({
        id: icon.id,
        name: icon.name,
        thumbnail: icon.thumbnails?.[0]?.url || "",
        style: icon.style?.name || "",
        family: icon.family?.name || "",
      })
    );

    return NextResponse.json({
      icons,
      total: data.meta?.pagination?.total || 0,
      page: Number(page),
      lastPage: data.meta?.pagination?.last_page || 1,
    });
  } catch (error: any) {
    console.error("Freepik fetch error:", error);
    return NextResponse.json(
      { error: "Erro ao conectar com Freepik" },
      { status: 500 }
    );
  }
}
