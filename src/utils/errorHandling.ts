export enum ErrorSeverity {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    FATAL = 'fatal'
}

export enum ErrorCode {
    FACE_DETECTION = 'FACE_DETECTION',
    AUDIO_PLAYBACK = 'AUDIO_PLAYBACK',
    FILE_UPLOAD = 'FILE_UPLOAD',
    MODEL_LOAD = 'MODEL_LOAD',
    WEBCAM_ACCESS = 'WEBCAM_ACCESS',
    UNKNOWN = 'UNKNOWN'
}

export interface ErrorMetadata {
    timestamp: Date;
    component?: string | undefined;
    details?: Record<string, unknown> | undefined;
}

export class AppError extends Error {
    public readonly timestamp: Date;

    constructor(
        message: string,
        public readonly code: ErrorCode,
        public readonly severity: ErrorSeverity,
        public readonly metadata: ErrorMetadata = { timestamp: new Date() }
    ) {
        super(message);
        this.name = 'AppError';
        this.timestamp = new Date();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            severity: this.severity,
            timestamp: this.timestamp,
            metadata: this.metadata
        };
    }
}

export function handleError(error: Error | AppError): void {
    if (error instanceof AppError) {
        const errorData = error.toJSON();
        
        switch (error.severity) {
            case ErrorSeverity.INFO:
                console.info('[App Info]', errorData);
                break;
            
            case ErrorSeverity.WARNING:
                console.warn('[App Warning]', errorData);
                // Optional: Send to analytics
                break;
            
            case ErrorSeverity.ERROR:
                console.error('[App Error]', errorData);
                // Send to error tracking service
                break;
            
            case ErrorSeverity.FATAL:
                console.error('[App Fatal Error]', errorData);
                // Log to error tracking service
                // Show user-friendly error message
                const errorMessage = 'A critical error occurred. The application will reload.';
                alert(errorMessage);
                window.location.reload();
                break;
            
            default:
                console.error('[Unexpected Error]', errorData);
        }
    } else {
        // Handle unknown errors
        console.error('[Unexpected Error]', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            timestamp: new Date()
        });
    }
}

// Usage example:
export function createError(
    message: string,
    code: ErrorCode,
    severity: ErrorSeverity,
    component?: string | undefined,
    details?: Record<string, unknown> | undefined
): AppError {
    return new AppError(message, code, severity, {
        timestamp: new Date(),
        component,
        details
    });
}