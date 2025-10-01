import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/plus$/, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const searchQuery = url.searchParams.get("q");
    const gameId = url.searchParams.get("gameId");

    if (!searchQuery && !gameId) {
      throw new Error('Parâmetro "q" (search) ou "gameId" é obrigatório');
    }

    const token = await getAccessToken();
    const clientId = Deno.env.get("TWITCH_CLIENT_ID")!;

    let finalResults: any[] = [];
    let apiCalypseQuery;

    if (gameId) {
      apiCalypseQuery = `
        fields 
            name, summary, first_release_date, cover.url, platforms.name, 
            involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
            category, parent_game, total_rating_count, alternative_names.name;
        where id = ${gameId};
        limit 1;
      `;
      finalResults = await callIgdb("games", apiCalypseQuery, token, clientId);
    } else if (searchQuery) {
      apiCalypseQuery = `
        fields 
            name, summary, first_release_date, cover.url, platforms.name, 
            involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
            category, parent_game, total_rating_count, alternative_names.name;
        where 
            (name ~ *"${searchQuery}"* | alternative_names.name ~ *"${searchQuery}"* | franchises.name ~ *"${searchQuery}"*) 
            & cover.url != null;
        limit 250;
      `;
      const rawResults = await callIgdb("games", apiCalypseQuery, token, clientId);

      const uniqueGamesById = new Map();
      rawResults.forEach((game: any) => {
        if (game && game.id) uniqueGamesById.set(game.id, game);
      });

      const scoredAndFilteredGames = Array.from(uniqueGamesById.values())
        .filter((game: any) =>
          ![1, 2, 3, 5, 6, 7, 10, 13, 14].includes(game.category) &&
          !["bundle", "edition", "goty"].some((termo) =>
            game.name.toLowerCase().includes(termo)
          )
        )
        .map((game: any) => {
          let relevanceScore = 0;
          const gameName = game.name.toLowerCase();
          const query = searchQuery.toLowerCase();

          if (gameName === query) relevanceScore += 100;
          else if (gameName.startsWith(query)) relevanceScore += 50;
          else if (gameName.includes(query)) relevanceScore += 10;

          if (game.alternative_names?.some((alt: any) => alt.name.toLowerCase().includes(query))) {
            relevanceScore += 5;
          }

          if (!game.parent_game) {
            relevanceScore += 20;
          }

          const popularityBonus = Math.log10(game.total_rating_count || 1) * 2;
          relevanceScore += popularityBonus;
          return { ...game, relevanceScore };
        });

      const groupedGames = new Map();
      scoredAndFilteredGames.forEach((game) => {
        const normalized = normalizeName(game.name);
        const existingGame = groupedGames.get(normalized);

        if (!existingGame || (game.total_rating_count || 0) > (existingGame.total_rating_count || 0)) {
          groupedGames.set(normalized, game);
        }
      });

      const bestCandidates = Array.from(groupedGames.values());
      bestCandidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
      finalResults = bestCandidates.slice(0, 40);
    }

    const gamesToCache = finalResults.map((game: any) => {
        let developer = 'Não informado';
        let publisher = 'Não informado';
        if (game.involved_companies) {
            const devCompany = game.involved_companies.find((c: any) => c.developer === true);
            const pubCompany = game.involved_companies.find((c: any) => c.publisher === true);
            if (devCompany) developer = devCompany.company.name;
            if (pubCompany) publisher = pubCompany.company.name;
        }
        return {
            id: game.id,
            name: game.name,
            release_year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
            cover_url: game.cover?.url ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}` : null,
            platforms: game.platforms?.map((p: any) => p.name).join(", ") || null,
            summary: game.summary || null,
            developer,
            publisher,
            last_fetched_at: new Date().toISOString(),
        };
    });

    if (gamesToCache.length > 0) {
      supabaseAdmin.from("games_cache").upsert(gamesToCache, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.error("Falha ao salvar no cache:", error);
        else console.log(`${gamesToCache.length} jogos salvos/atualizados no cache.`);
      });
    }

    const formattedGames = finalResults.map((game: any) => {
        let developer = 'Não informado';
        let publisher = 'Não informado';
        if (game.involved_companies) {
            const devCompany = game.involved_companies.find((c: any) => c.developer === true);
            const pubCompany = game.involved_companies.find((c: any) => c.publisher === true);
            if (devCompany) developer = devCompany.company.name;
            if (pubCompany) publisher = pubCompany.company.name;
        }
        const coverUrl = game.cover?.url?.replace("t_thumb", "t_cover_big");
        return {
            id: game.id,
            name: game.name,
            release_year: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : "N/A",
            cover_url: coverUrl ? `https:${coverUrl}` : null,
            platforms: game.platforms?.map((p: any) => p.name).join(", ") || "Não informado",
            summary: game.summary || "Sem resumo disponível.",
            developer,
            publisher,
        };
    });

    if (gameId && formattedGames.length > 0) {
      return new Response(JSON.stringify(formattedGames[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify(formattedGames), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    return new Response(String(err?.message ?? err), {
      status: 500,
      headers: corsHeaders,
    });
  }
});