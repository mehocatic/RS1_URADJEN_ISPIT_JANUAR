import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    ListDeliverersRequest,
    ListDeliverersResponse,
    GetDelivererByIdQueryDto,
    CreateDelivererCommand,
    UpdateDelivererCommand
} from './deliverers-api.model';
import { buildHttpParams } from '../../core/models/build-http-params';

@Injectable({
    providedIn: 'root',
})
export class DeliverersApiService {
    private readonly baseUrl = `${environment.apiUrl}/Deliverers`;
    private http = inject(HttpClient);

    list(request?: ListDeliverersRequest): Observable<ListDeliverersResponse> {
        const params = request ? buildHttpParams(request as any) : undefined;
        return this.http.get<ListDeliverersResponse>(this.baseUrl, { params });
    }

    getById(id: number): Observable<GetDelivererByIdQueryDto> {
        return this.http.get<GetDelivererByIdQueryDto>(`${this.baseUrl}/${id}`);
    }

    create(payload: CreateDelivererCommand): Observable<number> {
        return this.http.post<number>(this.baseUrl, payload);
    }

    update(id: number, payload: UpdateDelivererCommand): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
