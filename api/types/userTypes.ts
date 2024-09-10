export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export interface DeleteResponse {
    message: string;
}

export interface ErrorResponse {
    error: string;
}
