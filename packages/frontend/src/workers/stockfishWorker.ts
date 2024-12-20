let stockfishWorker = new Worker("/stockfish/stockfish.js");

export const initializeStockfish = () => {
    stockfishWorker.postMessage("uci");

}

export const postMessageToStockfish = (message: string) => {
    stockfishWorker.postMessage(message);
}

export const onStockfishMessage = (handleMessage: (event: MessageEvent) => void) => {
    stockfishWorker.onmessage = (e) => {
        handleMessage(e);
    }
}

export const removeStockfishMessage = () => {
    stockfishWorker.terminate();
    stockfishWorker = new Worker("/stockfish/stockfish.js");
}