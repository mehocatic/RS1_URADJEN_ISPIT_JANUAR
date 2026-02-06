import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { DeliverersApiService } from '../../../../api-services/deliverers/deliverers-api.service';
import { DelivererFormService } from '../services/deliverer-form.service';
import { ToasterService } from '../../../../core/services/toaster.service';
import {
    CreateDelivererCommand,
    UpdateDelivererCommand,
    DelivererType
} from '../../../../api-services/deliverers/deliverers-api.model';

export interface DelivererDialogData {
    mode: 'create' | 'edit';
    delivererId?: number;
}

@Component({
    selector: 'app-deliverer-upsert',
    standalone: false,
    templateUrl: './deliverer-upsert.component.html',
    styleUrl: './deliverer-upsert.component.scss',
    providers: [DelivererFormService]
})
export class DelivererUpsertComponent implements OnInit {
    private dialogRef = inject(MatDialogRef<DelivererUpsertComponent>);
    private data = inject<DelivererDialogData>(MAT_DIALOG_DATA);
    private api = inject(DeliverersApiService);
    private formService = inject(DelivererFormService);
    private toaster = inject(ToasterService);

    form!: FormGroup;
    isLoading = false;
    isEditMode = false;
    title = '';

    // Dropdown options for type
    typeOptions = [
        { value: DelivererType.External, label: 'External' },
        { value: DelivererType.Internal, label: 'Internal' },
        { value: DelivererType.Freelancer, label: 'Freelancer' }
    ];

    ngOnInit(): void {
        this.isEditMode = this.data.mode === 'edit';
        this.title = this.isEditMode ? 'Edit Deliverer' : 'New Deliverer';

        if (this.isEditMode && this.data.delivererId) {
            this.loadDeliverer(this.data.delivererId);
        } else {
            this.form = this.formService.createForm();
        }
    }

    private loadDeliverer(id: number): void {
        this.isLoading = true;
        this.api.getById(id).subscribe({
            next: (deliverer) => {
                this.form = this.formService.createForm(deliverer);
                this.isLoading = false;
            },
            error: (err) => {
                this.toaster.error('Failed to load deliverer');
                this.dialogRef.close(false);
            }
        });
    }

    onSubmit(): void {
        if (this.form.invalid || this.isLoading) {
            this.form.markAllAsTouched();
            return;
        }

        this.isLoading = true;

        if (this.isEditMode) {
            this.update();
        } else {
            this.create();
        }
    }

    private create(): void {
        const command: CreateDelivererCommand = {
            name: this.form.value.name.trim(),
            type: this.form.value.type,
            code: this.form.value.code.trim().toUpperCase(),
            isActive: this.form.value.isActive
        };

        this.api.create(command).subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => {
                this.isLoading = false;
                this.toaster.error('Failed to create deliverer');
            }
        });
    }

    private update(): void {
        const command: UpdateDelivererCommand = {
            name: this.form.value.name.trim(),
            type: this.form.value.type,
            code: this.form.value.code.trim().toUpperCase(),
            isActive: this.form.value.isActive
        };

        this.api.update(this.data.delivererId!, command).subscribe({
            next: () => this.dialogRef.close(true),
            error: (err) => {
                this.isLoading = false;
                this.toaster.error('Failed to update deliverer');
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    getErrorMessage(controlName: string): string {
        return this.formService.getErrorMessage(this.form, controlName);
    }
}
