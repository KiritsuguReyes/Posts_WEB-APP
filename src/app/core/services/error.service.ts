import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ToastMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

// Circular import prevention: ErrorService uses a callback instead of injecting ToastService
type ToastCallback = (type: ToastMessage['type'], message: string) => void;

@Injectable({ providedIn: 'root' })
export class ErrorService {
  private toastCallback?: ToastCallback;

  registerToast(cb: ToastCallback): void {
    this.toastCallback = cb;
  }

  handle(err: HttpErrorResponse): string {
    // Log completo del error en consola para debugging
    console.error('🚨 HTTP Error Details:', {
      status: err.status,
      statusText: err.statusText,
      url: err.url,
      message: err.error?.message,
      error: err.error,
      timestamp: new Date().toISOString()
    });

    const message = this.mapError(err);
    this.toastCallback?.('error', message);
    return message;
  }

  private mapError(err: HttpErrorResponse): string {
    if (!navigator.onLine) return 'Sin conexión a internet';
    
    // Solo mensajes amigables para el usuario, sin detalles técnicos
    switch (err.status) {
      case 400: return 'Algo salió mal';
      case 401: return 'Sesión expirada, vuelve a ingresar';
      case 403: return 'No tienes permiso para esta acción';
      case 404: return 'No encontrado';
      case 409: return 'El recurso ya existe';
      case 500: return 'Error del servidor, intenta más tarde';
      default:  return 'Error inesperado';
    }
  }
}
