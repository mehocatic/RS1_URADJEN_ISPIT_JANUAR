import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { DeliverersApiService } from '../../../../api-services/deliverers/deliverers-api.service';
import { DelivererFormService } from '../services/deliverer-form.service';
import { ToasterService } from '../../../../core/services/toaster.service';
import { UpdateDelivererCommand, DelivererType, GetDelivererByIdQueryDto } from '../../../../api-services/deliverers/deliverers-api.model';

@Component({
    selector: 'app-deliverers-edit',
    standalone: false,
    templateUrl: './deliverers-edit.component.html',
    styleUrl: './deliverers-edit.component.scss',
    providers: [DelivererFormService]
})
export class DeliverersEditComponent implements OnInit {
    private api = inject(DeliverersApiService);
    private formService = inject(DelivererFormService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private toaster = inject(ToasterService);

    form!: FormGroup;
    isLoading = false;
    isLoadingData = true;
    errorMessage = '';
    delivererId!: number;

    typeOptions = [
        { value: DelivererType.External, label: 'External' },
        { value: DelivererType.Internal, label: 'Internal' },
        { value: DelivererType.Freelancer, label: 'Freelancer' }
    ];

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam) {
            this.delivererId = +idParam;
            this.loadDeliverer();
        } else {
            this.router.navigate(['/admin/deliverers']);
        }
    }

    private loadDeliverer(): void {
        this.isLoadingData = true;
        this.api.getById(this.delivererId).subscribe({
            next: (deliverer: GetDelivererByIdQueryDto) => {
                this.form = this.formService.createForm(deliverer);
                this.isLoadingData = false;
            },
            error: (err: Error) => {
                this.toaster.error('Failed to load deliverer');
                console.error('Load deliverer error:', err);
                this.router.navigate(['/admin/deliverers']);
            }
        });
    }

    onSubmit(): void {
        if (this.form.invalid || this.isLoading) {
            this.form.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const command: UpdateDelivererCommand = {
            name: this.form.value.name.trim(),
            type: this.form.value.type,
            code: this.form.value.code.trim().toUpperCase(),
            isActive: this.form.value.isActive
        };

        this.api.update(this.delivererId, command).subscribe({
            next: () => {
                this.isLoading = false;
                this.toaster.success('Deliverer updated successfully');
                this.router.navigate(['/admin/deliverers']);
            },
            error: (err: Error) => {
                this.isLoading = false;
                this.errorMessage = 'Failed to update deliverer';
                console.error('Update deliverer error:', err);
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
