export enum ErrorCode {
    /* ---------------------- AUTH ERRORS ---------------------- */

    USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",      // When email/username already registered
    USER_NOT_FOUND = "USER_NOT_FOUND",                // When user is not found in DB
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",      // Wrong email/password during login
    PASSWORD_HASH_FAILED = "PASSWORD_HASH_FAILED",     // Error hashing password
    UNAUTHORIZED = "UNAUTHORIZED",                    // Missing/invalid user auth

    TOKEN_MISSING = "TOKEN_MISSING",                  // No access token provided
    TOKEN_INVALID = "TOKEN_INVALID",                  // Token failed verification
    TOKEN_EXPIRED = "TOKEN_EXPIRED",                  // Access token expired

    REFRESH_TOKEN_MISMATCH = "REFRESH_TOKEN_MISMATCH", // Incoming refresh token != stored one
    REFRESH_TOKEN_MISSING = "REFRESH_TOKEN_MISSING",   // Refresh token not found in cookie/body
    ACCESS_TOKEN_EXPIRED = "ACCESS_TOKEN_EXPIRED",     // Used to trigger refresh flow

    /* ---------------------- GENERAL ERRORS ---------------------- */

    VALIDATION_ERROR = "VALIDATION_ERROR",            // Input validation failure
    BAD_REQUEST = "BAD_REQUEST",                      // Incorrect payload/invalid request
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    PERMISSION_DENIED = "PERMISSION_DENIED",          //  permission not allowed 
    INVALID_ROLE = "INVALID_ROLE",                     // invalid role
    USER_INACTIVE = "USER_INACTIVE",
    USER_REGISTRATION_FAILED = "USER_REGISTRATION_FAILED",
    EVENT_PUBLISHING_FAILED = "EVENT_PUBLISHING_FAILED",
    FILE_NOT_FOUND = "FILE_NOT_FOUND",
}
