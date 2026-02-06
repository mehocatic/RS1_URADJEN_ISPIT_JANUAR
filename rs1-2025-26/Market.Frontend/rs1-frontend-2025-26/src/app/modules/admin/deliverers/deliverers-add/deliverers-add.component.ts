import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { DeliverersApiService } from '../../../../api-services/deliverers/deliverers-api.service';
import { DelivererFormService } from '../services/deliverer-form.service';
import { ToasterService } from '../../../../core/services/toaster.service';
import { CreateDelivererCommand, DelivererType } from '../../../../api-services/deliverers/deliverers-api.model';

@Component({
    selector: 'app-deliverers-add',
    standalone: false,
    templateUrl: './deliverers-add.component.html',
    styleUrl: './deliverers-add.component.scss',
    providers: [DelivererFormService]
})
export class DeliverersAddComponent implements OnInit {
    private api = inject(DeliverersApiService);
    private formService = inject(DelivererFormService);
    private router = inject(Router);
    private toaster = inject(ToasterService);

    form!: FormGroup;
    isLoading = false;
    errorMessage = '';

    typeOptions = [
        { value: DelivererType.External, label: 'External' },
        { value: DelivererType.Internal, label: 'Internal' },
        { value: DelivererType.Freelancer, label: 'Freelancer' }
    ];

    ngOnInit(): void {
        this.form = this.formService.createForm();
    }

    onSubmit(): void {
        if (this.form.invalid || this.isLoading) {
            this.form.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const command: CreateDelivererCommand = {
            name: this.form.value.name.trim(),
            type: this.form.value.type,
            code: this.form.value.code.trim().toUpperCase(),
            isActive: this.form.value.isActive
        };

        this.api.create(command).subscribe({
            next: () => {
                this.isLoading = false;
                this.toaster.success('Deliverer created successfully');
                this.router.navigate(['/admin/deliverers']);
            },
            error: (err: Error) => {
                this.isLoading = false;
                this.errorMessage = 'Failed to create deliverer';
                console.error('Create deliverer error:', err);
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/admin/deliverers']);
    }

    hasError(controlName: string): boolean {
        const control = this.form.get(controlName);
        return control ? control.invalid && control.touched : false;
    }

    getErrorMessage(controlName: string): string {
        return this.formService.getErrorMessage(this.form, controlName);
    }
}
