class ApiResponse {
    static success(data: any) {
        return {
            success: true,
            data,
            error: null,
        };
    }

    static error(errorMessage: string) {
        return {
            success: false,
            data: null,
            error: errorMessage,
        };
    }
}

export default ApiResponse;
