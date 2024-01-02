export function delay(ms: number = 0) {
    return new Promise((resolve: (args: void) => void) => {
        setTimeout(resolve, ms);
    });
}
