import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GetDelivererByIdQueryDto } from '../../../../api-services/deliverers/deliverers-api.model';

@Injectable()
export class DelivererFormService {
    private fb = inject(FormBuilder);

    createForm(deliverer?: GetDelivererByIdQueryDto): FormGroup {
        return this.fb.group({
            name: [
                deliverer?.name ?? '',
                [Validators.required, Validators.maxLength(100)]
            ],
            type: [
                deliverer?.type ?? 0,
                [Validators.required]
            ],
            code: [
                deliverer?.code ?? '',
                [
                    Validators.required,
                    Validators.maxLength(3),
                    Validators.pattern('^[a-zA-Z0-9]+$')
                ]
            ],
            isActive: [deliverer?.isActive ?? true]
        });
    }

    getErrorMessage(form: FormGroup, controlName: string): string {
        const control = form.get(controlName);
        if (!control?.errors || !control.touched) return '';

        if (control.errors['required']) return 'This field is required';
        if (control.errors['maxlength']) {
            return `Maximum ${control.errors['maxlength'].requiredLength} characters`;
        }
        if (control.errors['pattern']) return 'Only alphanumeric characters allowed';

        return 'Invalid value';
    }
}
