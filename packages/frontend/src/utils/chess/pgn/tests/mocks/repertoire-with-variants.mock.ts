import { IMoveNode } from "@chess-opening-master/common";

export const testRepertoireMock: IMoveNode = {
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
      comment: "",
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
          comment: undefined,
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
                  children: [
                    {
                      id: "f1c4",
                      move: {
                        color: "w",
                        piece: "b",
                        from: "f1",
                        to: "c4",
                        san: "Bc4",
                        flags: "n",
                        lan: "f1c4",
                        before:
                          "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
                        after:
                          "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
                      },
                      variantName: "Apertura Italiana",
                      children: [],
                    },
                    {
                      id: "f1b5",
                      move: {
                        color: "w",
                        piece: "b",
                        from: "f1",
                        to: "b5",
                        san: "Bb5",
                        flags: "n",
                        lan: "f1b5",
                        before:
                          "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
                        after:
                          "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
                      },
                      variantName: "Apertura española",
                      children: [
                        {
                          id: "a7a6",
                          move: {
                            color: "b",
                            piece: "p",
                            from: "a7",
                            to: "a6",
                            san: "a6",
                            flags: "n",
                            lan: "a7a6",
                            before:
                              "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
                            after:
                              "r1bqkbnr/1ppp1ppp/p1n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4",
                          },
                          children: [],
                        },
                        {
                          id: "g8f6",
                          move: {
                            color: "b",
                            piece: "n",
                            from: "g8",
                            to: "f6",
                            san: "Nf6",
                            flags: "n",
                            lan: "g8f6",
                            before:
                              "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
                            after:
                              "r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
                          },
                          variantName: "Defensa Berlinesa",
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "d2d4",
      move: {
        color: "w",
        piece: "p",
        from: "d2",
        to: "d4",
        san: "d4",
        flags: "b",
        lan: "d2d4",
        before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        after: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
      },
      children: [
        {
          id: "d7d5",
          move: {
            color: "b",
            piece: "p",
            from: "d7",
            to: "d5",
            san: "d5",
            flags: "b",
            lan: "d7d5",
            before:
              "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1",
            after:
              "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
          },
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
                  "rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2",
                after:
                  "rnbqkbnr/ppp1pppp/8/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq - 1 2",
              },
              children: [
                {
                  id: "g8f6",
                  move: {
                    color: "b",
                    piece: "n",
                    from: "g8",
                    to: "f6",
                    san: "Nf6",
                    flags: "n",
                    lan: "g8f6",
                    before:
                      "rnbqkbnr/ppp1pppp/8/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R b KQkq - 1 2",
                    after:
                      "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 2 3",
                  },
                  children: [
                    {
                      id: "e2e3",
                      move: {
                        color: "w",
                        piece: "p",
                        from: "e2",
                        to: "e3",
                        san: "e3",
                        flags: "n",
                        lan: "e2e3",
                        before:
                          "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 2 3",
                        after:
                          "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R b KQkq - 0 3",
                      },
                      children: [
                        {
                          id: "e7e6",
                          move: {
                            color: "b",
                            piece: "p",
                            from: "e7",
                            to: "e6",
                            san: "e6",
                            flags: "n",
                            lan: "e7e6",
                            before:
                              "rnbqkb1r/ppp1pppp/5n2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R b KQkq - 0 3",
                            after:
                              "rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 4",
                          },
                          children: [
                            {
                              id: "f1d3",
                              move: {
                                color: "w",
                                piece: "b",
                                from: "f1",
                                to: "d3",
                                san: "Bd3",
                                flags: "n",
                                lan: "f1d3",
                                before:
                                  "rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/4PN2/PPP2PPP/RNBQKB1R w KQkq - 0 4",
                                after:
                                  "rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/3BPN2/PPP2PPP/RNBQK2R b KQkq - 1 4",
                              },
                              children: [
                                {
                                  id: "c7c5",
                                  move: {
                                    color: "b",
                                    piece: "p",
                                    from: "c7",
                                    to: "c5",
                                    san: "c5",
                                    flags: "b",
                                    lan: "c7c5",
                                    before:
                                      "rnbqkb1r/ppp2ppp/4pn2/3p4/3P4/3BPN2/PPP2PPP/RNBQK2R b KQkq - 1 4",
                                    after:
                                      "rnbqkb1r/pp3ppp/4pn2/2pp4/3P4/3BPN2/PPP2PPP/RNBQK2R w KQkq - 0 5",
                                  },
                                  children: [
                                    {
                                      id: "c2c3",
                                      move: {
                                        color: "w",
                                        piece: "p",
                                        from: "c2",
                                        to: "c3",
                                        san: "c3",
                                        flags: "n",
                                        lan: "c2c3",
                                        before:
                                          "rnbqkb1r/pp3ppp/4pn2/2pp4/3P4/3BPN2/PPP2PPP/RNBQK2R w KQkq - 0 5",
                                        after:
                                          "rnbqkb1r/pp3ppp/4pn2/2pp4/3P4/2PBPN2/PP3PPP/RNBQK2R b KQkq - 0 5",
                                      },
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
                                              "rnbqkb1r/pp3ppp/4pn2/2pp4/3P4/2PBPN2/PP3PPP/RNBQK2R b KQkq - 0 5",
                                            after:
                                              "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P4/2PBPN2/PP3PPP/RNBQK2R w KQkq - 1 6",
                                          },
                                          children: [
                                            {
                                              id: "b1d2",
                                              move: {
                                                color: "w",
                                                piece: "n",
                                                from: "b1",
                                                to: "d2",
                                                san: "Nbd2",
                                                flags: "n",
                                                lan: "b1d2",
                                                before:
                                                  "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P4/2PBPN2/PP3PPP/RNBQK2R w KQkq - 1 6",
                                                after:
                                                  "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQK2R b KQkq - 2 6",
                                              },
                                              children: [
                                                {
                                                  id: "f8d6",
                                                  move: {
                                                    color: "b",
                                                    piece: "b",
                                                    from: "f8",
                                                    to: "d6",
                                                    san: "Bd6",
                                                    flags: "n",
                                                    lan: "f8d6",
                                                    before:
                                                      "r1bqkb1r/pp3ppp/2n1pn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQK2R b KQkq - 2 6",
                                                    after:
                                                      "r1bqk2r/pp3ppp/2nbpn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQK2R w KQkq - 3 7",
                                                  },
                                                  children: [
                                                    {
                                                      id: "e1g1",
                                                      move: {
                                                        color: "w",
                                                        piece: "k",
                                                        from: "e1",
                                                        to: "g1",
                                                        san: "O-O",
                                                        flags: "k",
                                                        lan: "e1g1",
                                                        before:
                                                          "r1bqk2r/pp3ppp/2nbpn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQK2R w KQkq - 3 7",
                                                        after:
                                                          "r1bqk2r/pp3ppp/2nbpn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQ1RK1 b kq - 4 7",
                                                      },
                                                      children: [
                                                        {
                                                          id: "e8g8",
                                                          move: {
                                                            color: "b",
                                                            piece: "k",
                                                            from: "e8",
                                                            to: "g8",
                                                            san: "O-O",
                                                            flags: "k",
                                                            lan: "e8g8",
                                                            before:
                                                              "r1bqk2r/pp3ppp/2nbpn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQ1RK1 b kq - 4 7",
                                                            after:
                                                              "r1bq1rk1/pp3ppp/2nbpn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQ1RK1 w - - 5 8",
                                                          },
                                                          children: [
                                                            {
                                                              id: "d1e2",
                                                              move: {
                                                                color: "w",
                                                                piece: "q",
                                                                from: "d1",
                                                                to: "e2",
                                                                san: "Qe2",
                                                                flags: "n",
                                                                lan: "d1e2",
                                                                before:
                                                                  "r1bq1rk1/pp3ppp/2nbpn2/2pp4/3P4/2PBPN2/PP1N1PPP/R1BQ1RK1 w - - 5 8",
                                                                after:
                                                                  "r1bq1rk1/pp3ppp/2nbpn2/2pp4/3P4/2PBPN2/PP1NQPPP/R1B2RK1 b - - 6 8",
                                                              },
                                                              comment:
                                                                "",
                                                              variantName:
                                                                "Sistema Colle",
                                                              children: [],
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
