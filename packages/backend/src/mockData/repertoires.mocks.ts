import { Repertoire } from "../models/Repertoire";

export const repertoireMockData: Repertoire = {
  _id: {
    $oid: "6444e7b3d9f33ea3203dd157",
  },
  name: "Repertorio principal (blancas)",
  moveNodes: {
    id: "initial",
    move: null,
    children: [
      {
        id: "e2e4",
        move: {
          color: "w",
          piece: "p",
          from: "e2",
          to: "e4",
          san: "e4",
          flags: "b",
          lan: "e2e4",
          before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          after: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        },
        comment:
          "La jugada 1. e4, la Apertura del Peón del Rey, es muy popular en el ajedrez debido a su impacto en el control de casillas y el desarrollo de piezas. Al jugar 1. e4, las blancas liberan líneas para la dama y el alfil del rey, facilitando un rápido desarrollo y lucha por el control de d5 y f5. Además, esta apertura asegura que el caballo de las blancas en g1 pueda desarrollarse a f3 sin temor a ser expulsado por un peón, evitando perder un tiempo. Por otro lado, las negras deben considerar que f6 no será seguro para su caballo en g8 si las blancas pueden avanzar su peón de e4 a e5, por lo que es necesario prevenir ese avance. En resumen, la jugada 1. e4 es importante debido a su influencia en el control de casillas centrales y el desarrollo de piezas clave en la partida.",
        children: [
          {
            id: "e7e5",
            move: {
              color: "b",
              piece: "p",
              from: "e7",
              to: "e5",
              san: "e5",
              flags: "b",
              lan: "e7e5",
              before:
                "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
              after:
                "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
            },
            comment:
              "La jugada 1...e5, conocida como Juego Abierto o Doble Peón del Rey, es la respuesta clásica de las negras a 1. e4. Al imitar la jugada de las blancas, las negras obtienen una porción igual del centro y espacio para desarrollar sus piezas. Sin embargo, mantener la simetría puede dar ventaja a las blancas por mover primero y el peón en e5 queda indefenso. La respuesta más popular de las blancas es 2. Cf3, que amenaza el peón indefenso de las negras mientras desarrolla una pieza para enrocar en el flanco del rey",
            children: [
              {
                id: "g1f3",
                move: {
                  color: "w",
                  piece: "n",
                  from: "g1",
                  to: "f3",
                  san: "Nf3",
                  flags: "n",
                  lan: "g1f3",
                  before:
                    "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
                  after:
                    "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
                },
                comment:
                  "Cf3, en el Juego Abierto, amenaza el valioso peón central de las negras, mientras el peón de las blancas permanece seguro. Las negras deben decidir si desafiar al peón blanco en e4 o apoyar al peón negro en e5. Apoyar el peón negro con 2...Cc6 es el movimiento natural, defendiendo el peón y controlando la casilla d4 sin comprometer otro peón. Esta respuesta es cinco veces más popular que cualquier otra. Otra opción segura es 2...d6, la Defensa Philidor, que restringe el alfil en f8 y concede ventaja territorial a las blancas, pero construye una fortaleza difícil de derribar. Sin embargo, se considera una forma inferior de defender el peón e5, ya que las blancas pueden obtener ventaja fácilmente.",
                children: [
                  {
                    id: "b8c6",
                    move: {
                      color: "b",
                      piece: "n",
                      from: "b8",
                      to: "c6",
                      san: "Nc6",
                      flags: "n",
                      lan: "b8c6",
                      before:
                        "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
                      after:
                        "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
                    },
                    comment:
                      "Cc6 es el movimiento natural, combinando la defensa del peón con el control de la casilla d4 y evitando comprometer otro peón por ahora.\n\nLas blancas tienen múltiples opciones aquí que pueden llevar a juegos muy diferentes:-\n-Ab5 es la más jugada, poniendo presión sobre el caballo que defiende el peón.\n-Ac4 es más tranquila, en lugar de atacar al caballo, las blancas apuntan al débil peón f7.\n-d4 es agresiva, el juego subsiguiente puede resultar en una partida muy abierta.\n-Cc3 es la continuación más tranquila y común.\n-c3, la apertura Ponziani, abre la diagonal blanca para la dama, permite un eventual avance de peón d4 y controla d4 y b4 (posibles posiciones para el caballo negro) a costa de limitar el movimiento del caballo.",
                    children: [],
                    circles: [],
                    arrows: [],
                  },
             
                ],
                circles: [],
                arrows: [],
              },
            ],
            circles: [],
            arrows: [],
          }
        ],
        circles: [],
        arrows: [],
      }
    ],
    circles: [],
    arrows: [],
  },
  orientation: "white",
  order: 1,
};
