import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
};

async function fetchGameFromIGDB(gameId: number) {
  const clientId = Deno.env.get("TWITCH_CLIENT_ID");
  const clientSecret = Deno.env.get("TWITCH_CLIENT_SECRET");

  const tokenResponse = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" },
  );
  if (!tokenResponse.ok) throw new Error("Falha ao obter token da Twitch.");
  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  const apiCalypseQuery = `
          fields name, summary, first_release_date, cover.url, platforms.name;
          where id = ${gameId};
          limit 1;
      `;

  const igdbResponse = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": clientId!,
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json",
    },
    body: apiCalypseQuery,
  });

  if (!igdbResponse.ok) {
    throw new Error(`Erro na API IGDB: ${await igdbResponse.text()}`);
  }

  const gamesData = await igdbResponse.json();
  return gamesData.length > 0 ? gamesData[0] : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { gameId } = await req.json();
    if (!gameId) {
      throw new Error("gameId é obrigatório no corpo da requisição.");
    }

    const gameData = await fetchGameFromIGDB(gameId);

    if (!gameData) {
      throw new Error(`Jogo com ID ${gameId} não encontrado na IGDB.`);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const gameToCache = {
      id: gameData.id,
      name: gameData.name,
      release_year: gameData.first_release_date
        ? new Date(gameData.first_release_date * 1000).getFullYear()
        : null,
      cover_url: gameData.cover?.url
        ? `https:${gameData.cover.url.replace("t_thumb", "t_cover_big")}`
        : null,
      platforms: gameData.platforms?.map((p: any) => p.name).join(", ") || null,
      summary: gameData.summary || null,
      last_fetched_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin.from("games_cache").upsert(
      gameToCache,
    );
    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Jogo atualizado com sucesso!" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
