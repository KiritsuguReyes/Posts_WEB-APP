import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, retry, throwError, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Comment } from '../../../core/models/comment.model';
import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';

export interface CommentsQuery {
  postId: string;
  page?: number;
  limit?: number;
}

export interface CreateCommentDto {
  postId: string;
  body: string;
}

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/comments`;

  getByPost(query: CommentsQuery): Observable<PaginatedResponse<Comment>> {
    let params = new HttpParams();
    
    // Parámetros de paginación
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    
    // PostId como query parameter separado
    params = params.set('postId', query.postId);

    return this.http.get<PaginatedResponse<Comment>>(`${this.apiUrl}/paginated`, { params }).pipe(
      retry({ count: 2, delay: (_, retryCount) => timer(retryCount * 1000) }),
      catchError(err => throwError(() => err))
    );
  }

  create(dto: CreateCommentDto): Observable<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(this.apiUrl, dto).pipe(
      catchError(err => throwError(() => err))
    );
  }

  update(id: string, body: string): Observable<ApiResponse<Comment>> {
    return this.http.put<ApiResponse<Comment>>(`${this.apiUrl}/${id}`, { body }).pipe(
      retry({ count: 2, delay: (_, retryCount) => timer(retryCount * 1000) }),
      catchError(err => throwError(() => err))
    );
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
