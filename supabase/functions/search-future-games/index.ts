import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
};

let accessToken: string | null = null;

async function getAccessToken() {
  if (accessToken) return accessToken;
  const clientId = Deno.env.get("TWITCH_CLIENT_ID");
  const clientSecret = Deno.env.get("TWITCH_CLIENT_SECRET");
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" },
  );
  if (!response.ok) {
    throw new Error("Falha ao obter token de acesso da Twitch");
  }
  const data = await response.json();
  accessToken = data.access_token;
  return accessToken;
}

async function callIgdb(
  endpoint: string,
  query: string,
  token: string,
  clientId: string,
) {
  const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
    body: query,
  });
  if (!response.ok) {
    throw new Error(`Erro na API IGDB: ${await response.text()}`);
  }
  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const token = await getAccessToken();
    const clientId = Deno.env.get("TWITCH_CLIENT_ID")!;

    const dataAtual = Math.floor(Date.now() / 1000);

    const apiCalypseQuery = `
        fields
            name,
            summary,
            first_release_date,
            cover.url,
            platforms.name,
            hypes;
        where
            first_release_date > ${dataAtual}
            & cover.url != null
            & platforms != null
            & hypes > 5;
        sort first_release_date asc;
        limit 20;
    `;

    const upcomingGames = await callIgdb("games", apiCalypseQuery, token, clientId);

    const formattedGames = upcomingGames.map((game: any) => {
      const coverUrl = game.cover?.url?.replace("t_thumb", "t_cover_big");
      return {
        id: game.id,
        name: game.name,
        release_date: new Date(game.first_release_date * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
        thumb: coverUrl ? `https:${coverUrl}` : null,
        platforms: game.platforms?.map((p: any) => p.name).join(", ") || "A confirmar",
        summary: game.summary || "Sem resumo disponível.",
      };
    });

    return new Response(JSON.stringify(formattedGames), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
