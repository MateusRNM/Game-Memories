export interface Game {
    id: number;
    nome: string;
    data_lancamento: number | string;
    thumb: string | null;
    plataformas: string;
    sumario: string;
}

export interface GameCatalog {
    game: Game;
    status: number;
    adicionadoEm: string;
    plataformaJogando: number;
    comecoGameplay: string;
    finalizadoEm: string;
}