import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, retry, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Post } from '../../../core/models/post.model';
import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';

export interface PostsQuery {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
}

export interface CreatePostDto {
  title: string;
  body: string;
  author: string;
}

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/posts`;

  getAll(query: PostsQuery = {}): Observable<PaginatedResponse<Post>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.search?.trim()) params = params.set('search', query.search.trim());
    if (query.userId?.trim()) params = params.set('userId', query.userId.trim());

    return this.http.get<PaginatedResponse<Post>>(`${this.apiUrl}/paginated`, { params }).pipe(
      retry(2),
      catchError(err => throwError(() => err))
    );
  }

  getById(id: string): Observable<ApiResponse<Post>> {
    return this.http.get<ApiResponse<Post>>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  create(dto: CreatePostDto): Observable<ApiResponse<Post>> {
    return this.http.post<ApiResponse<Post>>(this.apiUrl, dto).pipe(
      catchError(err => throwError(() => err))
    );
  }

  update(id: string, dto: Partial<CreatePostDto>): Observable<ApiResponse<Post>> {
    return this.http.put<ApiResponse<Post>>(`${this.apiUrl}/${id}`, dto).pipe(
      catchError(err => throwError(() => err))
    );
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  deleteBulk(ids: string[]): Observable<ApiResponse<{ deletedCount: number }>> {
    return this.http.delete<ApiResponse<{ deletedCount: number }>>(`${this.apiUrl}/bulk`, { body: { ids } }).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
