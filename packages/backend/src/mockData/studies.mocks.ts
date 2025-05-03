import { Study } from "../models/Study";

export const studyMock: Study = {
    _id: {
        $oid: "6804c4790b2860eedd367474"
    },
    name: "Aperturas",
    studies: [
        {
            id: "6804c49a0b2860eedd367477",
            name: "Repertorio con blancas",
            tags: [
                "repertorio",
                "blancas"
            ],
            entries: [
                {
                    id: "6804c5270b2860eedd36747c",
                    title: "Dama vs peón",
                    externalUrl: "https://lichess.org/study/iKCwrOwE",
                    description: "Finales de dama vs peón"
                }
            ],
            sessions: [
                {
                    id: "681266861c9ffefa30ff607d",
                    start: "2025-04-30",
                    duration: 900,
                    manual: true,
                    comment: "Repasando defensa morphy(española)"
                }
            ]
        }
    ]
};