import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseListPagedComponent } from '../../../core/components/base-classes/base-list-paged-component';
import { DeliverersApiService } from '../../../api-services/deliverers/deliverers-api.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { DialogHelperService } from '../../shared/services/dialog-helper.service';
import { DialogButton, DialogResult } from '../../shared/models/dialog-config.model';
import {
    ListDeliverersRequest,
    ListDeliverersQueryDto,
    DelivererType
} from '../../../api-services/deliverers/deliverers-api.model';

@Component({
    selector: 'app-deliverers',
    standalone: false,
    templateUrl: './deliverers.component.html',
    styleUrl: './deliverers.component.scss',
})
export class DeliverersComponent
    extends BaseListPagedComponent<ListDeliverersQueryDto, ListDeliverersRequest>
    implements OnInit {
    private api = inject(DeliverersApiService);
    private router = inject(Router);
    private toaster = inject(ToasterService);
    private dialogHelper = inject(DialogHelperService);

    displayedColumns: string[] = ['name', 'type', 'code', 'isActive', 'actions'];

    constructor() {
        super();
        this.request = new ListDeliverersRequest();
    }

    ngOnInit(): void {
        this.initList();
    }

    protected loadPagedData(): void {
        this.startLoading();

        this.api.list(this.request).subscribe({
            next: (response) => {
                this.handlePageResult(response);
                this.stopLoading();
            },
            error: (err) => {
                this.stopLoading('Failed to load deliverers');
                console.error('Load error:', err);
            },
        });
    }

    // Search on Enter key (case-insensitive handled by backend)
    onSearchChange(searchTerm: string): void {
        this.request.search = searchTerm;
        this.request.paging.page = 1; // Reset to first page
        this.loadPagedData();
    }

    // Map enum to display text
    getTypeLabel(type: DelivererType): string {
        const labels: Record<DelivererType, string> = {
            [DelivererType.External]: 'External',
            [DelivererType.Internal]: 'Internal',
            [DelivererType.Freelancer]: 'Freelancer'
        };
        return labels[type] || 'Unknown';
    }

    // Map enum to CSS class
    getTypeClass(type: DelivererType): string {
        const classes: Record<DelivererType, string> = {
            [DelivererType.External]: 'type-external',
            [DelivererType.Internal]: 'type-internal',
            [DelivererType.Freelancer]: 'type-freelancer'
        };
        return classes[type] || '';
    }

    onCreate(): void {
        this.router.navigate(['/admin/deliverers/add']);
    }

    onEdit(deliverer: ListDeliverersQueryDto): void {
        this.router.navigate(['/admin/deliverers', deliverer.id, 'edit']);
    }

    onDelete(deliverer: ListDeliverersQueryDto): void {
        // Confirmation modal (exam requirement!)
        this.dialogHelper.confirmDelete(deliverer.name).subscribe((result: DialogResult | undefined) => {
            if (result && result.button === DialogButton.DELETE) {
                this.performDelete(deliverer);
            }
        });
    }

    private performDelete(deliverer: ListDeliverersQueryDto): void {
        this.api.delete(deliverer.id).subscribe({
            next: () => {
                this.toaster.success('Deliverer deleted successfully');
                this.loadPagedData();
            },
            error: (err) => {
                this.toaster.error('Failed to delete deliverer');
                console.error('Delete error:', err);
            },
        });
    }
}
