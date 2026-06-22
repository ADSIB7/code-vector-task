export function withErrorBoundary(callback, onError) {
    try {
        callback();
    } catch (error) {
        onError(error);
    }
}
