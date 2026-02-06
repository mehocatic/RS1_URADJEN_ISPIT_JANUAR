# EXAM Task 1: Deliverer CRUD - Complete Step-by-Step Guide

## Overview
You need to implement a complete CRUD module for **Deliverer** (carrier/supplier) entity.
The best template to copy from is **ProductCategories** - it has almost identical structure.

---

## WHAT YOU NEED TO CREATE

### Backend Files (14 files)
```
Market.Backend/
├── Market.Domain/Entities/Delivery/
│   ├── DelivererEntity.cs           ← NEW
│   └── DelivererType.cs             ← NEW (enum)
├── Market.Application/Modules/Delivery/Deliverers/
│   ├── Commands/
│   │   ├── Create/
│   │   │   ├── CreateDelivererCommand.cs
│   │   │   └── CreateDelivererCommandHandler.cs
│   │   ├── Update/
│   │   │   ├── UpdateDelivererCommand.cs
│   │   │   └── UpdateDelivererCommandHandler.cs
│   │   └── Delete/
│   │       ├── DeleteDelivererCommand.cs
│   │       └── DeleteDelivererCommandHandler.cs
│   └── Queries/
│       ├── List/
│       │   ├── ListDeliverersQuery.cs
│       │   ├── ListDeliverersQueryDto.cs
│       │   └── ListDeliverersQueryHandler.cs
│       └── GetById/
│           ├── GetDelivererByIdQuery.cs
│           ├── GetDelivererByIdQueryDto.cs
│           └── GetDelivererByIdQueryHandler.cs
├── Market.API/Controllers/
│   └── DeliverersController.cs
└── Market.Infrastructure/Database/
    └── (modify DatabaseContext.cs)
```

### Frontend Files (6 files + modifications)
```
Market.Frontend/rs1-frontend-2025-26/src/app/
├── api-services/deliverers/
│   ├── deliverers-api.service.ts    ← NEW
│   └── deliverers-api.models.ts     ← NEW
└── modules/admin/deliverers/
    ├── deliverers.component.ts       ← NEW
    ├── deliverers.component.html     ← NEW
    ├── deliverers.component.scss     ← NEW
    └── deliverer-upsert/
        ├── deliverer-upsert.component.ts    ← NEW
        ├── deliverer-upsert.component.html  ← NEW
        └── deliverer-upsert.component.scss  ← NEW
```

---

## STEP-BY-STEP IMPLEMENTATION

---

## PART 1: BACKEND

### Step 1: Create the Enum (DelivererType)

**Create file:** `Market.Domain/Entities/Delivery/DelivererType.cs`

**Copy pattern from:** Any existing enum in Domain

```csharp
namespace Market.Domain.Entities.Delivery;

/// <summary>
/// Type of deliverer/supplier
/// </summary>
public enum DelivererType
{
    External = 1,
    Internal = 2,
    Freelancer = 3
}
```

**WHY:** The exam requires DelivererType as enum (External, Internal, Freelancer).

---

### Step 2: Create the Entity (DelivererEntity)

**Create file:** `Market.Domain/Entities/Delivery/DelivererEntity.cs`

**Copy pattern from:** `Market.Domain/Entities/Catalog/ProductCategoryEntity.cs`

```csharp
using Market.Domain.Common;

namespace Market.Domain.Entities.Delivery;

/// <summary>
/// Represents a deliverer/carrier entity.
/// </summary>
public class DelivererEntity : BaseEntity
{
    /// <summary>
    /// Name of the deliverer (required)
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Type of deliverer (External, Internal, Freelancer)
    /// </summary>
    public DelivererType Type { get; set; }

    /// <summary>
    /// Unique code (max 3 alphanumeric characters)
    /// </summary>
    public string Code { get; set; }

    /// <summary>
    /// Indicates whether the deliverer is active
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Constraints for validation
    /// </summary>
    public static class Constraints
    {
        public const int NameMaxLength = 100;
        public const int CodeMaxLength = 3;
    }
}
```

**WHY:** BaseEntity provides Id, CreatedAt, etc. You add properties required by exam.

---

### Step 3: Add DbSet to DatabaseContext

**Modify file:** `Market.Infrastructure/Database/DatabaseContext.cs`

**Add this line** after existing DbSets:

```csharp
public DbSet<DelivererEntity> Deliverers => Set<DelivererEntity>();
```

**Full context after modification:**
```csharp
public partial class DatabaseContext : DbContext, IAppDbContext
{
    public DbSet<ProductCategoryEntity> ProductCategories => Set<ProductCategoryEntity>();
    public DbSet<ProductEntity> Products => Set<ProductEntity>();
    public DbSet<MarketUserEntity> Users => Set<MarketUserEntity>();
    public DbSet<RefreshTokenEntity> RefreshTokens => Set<RefreshTokenEntity>();
    public DbSet<OrderEntity> Orders => Set<OrderEntity>();
    public DbSet<OrderItemEntity> OrderItems => Set<OrderItemEntity>();
    public DbSet<DelivererEntity> Deliverers => Set<DelivererEntity>();  // ← ADD THIS

    // ... rest of file
}
```

**WHY:** EF Core needs DbSet to access table. Also add to IAppDbContext interface!

---

### Step 4: Add to IAppDbContext Interface

**Modify file:** `Market.Application/Abstractions/IAppDbContext.cs`

**Add this line:**
```csharp
DbSet<DelivererEntity> Deliverers { get; }
```

---

### Step 5: Create List Query Files

**Create folder:** `Market.Application/Modules/Delivery/Deliverers/Queries/List/`

**File 1:** `ListDeliverersQuery.cs`
```csharp
namespace Market.Application.Modules.Delivery.Deliverers.Queries.List;

public sealed class ListDeliverersQuery : BasePagedQuery<ListDeliverersQueryDto>
{
    public string? Search { get; init; }
}
```

**File 2:** `ListDeliverersQueryDto.cs`
```csharp
using Market.Domain.Entities.Delivery;

namespace Market.Application.Modules.Delivery.Deliverers.Queries.List;

public class ListDeliverersQueryDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public DelivererType Type { get; set; }
    public string Code { get; set; }
    public bool IsActive { get; set; }
}
```

**File 3:** `ListDeliverersQueryHandler.cs`

**Copy pattern from:** `ListProductCategoriesQueryHandler.cs`

```csharp
namespace Market.Application.Modules.Delivery.Deliverers.Queries.List;

public sealed class ListDeliverersQueryHandler(IAppDbContext ctx)
    : IRequestHandler<ListDeliverersQuery, PageResult<ListDeliverersQueryDto>>
{
    public async Task<PageResult<ListDeliverersQueryDto>> Handle(
        ListDeliverersQuery request, CancellationToken ct)
    {
        var q = ctx.Deliverers.AsNoTracking();

        // Search filter - case insensitive
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.ToLower();
            q = q.Where(x => x.Name.ToLower().Contains(searchLower));
        }

        var projectedQuery = q.OrderBy(x => x.Name)
            .Select(x => new ListDeliverersQueryDto
            {
                Id = x.Id,
                Name = x.Name,
                Type = x.Type,
                Code = x.Code,
                IsActive = x.IsActive
            });

        return await PageResult<ListDeliverersQueryDto>.FromQueryableAsync(projectedQuery, request.Paging, ct);
    }
}
```

**WHY:** Handler implements search with case-insensitive filter and pagination.

---

### Step 6: Create GetById Query Files

**Create folder:** `Market.Application/Modules/Delivery/Deliverers/Queries/GetById/`

**File 1:** `GetDelivererByIdQuery.cs`
```csharp
namespace Market.Application.Modules.Delivery.Deliverers.Queries.GetById;

public class GetDelivererByIdQuery : IRequest<GetDelivererByIdQueryDto>
{
    public int Id { get; set; }
}
```

**File 2:** `GetDelivererByIdQueryDto.cs`
```csharp
using Market.Domain.Entities.Delivery;

namespace Market.Application.Modules.Delivery.Deliverers.Queries.GetById;

public class GetDelivererByIdQueryDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public DelivererType Type { get; set; }
    public string Code { get; set; }
    public bool IsActive { get; set; }
}
```

**File 3:** `GetDelivererByIdQueryHandler.cs`
```csharp
namespace Market.Application.Modules.Delivery.Deliverers.Queries.GetById;

public class GetDelivererByIdQueryHandler(IAppDbContext ctx)
    : IRequestHandler<GetDelivererByIdQuery, GetDelivererByIdQueryDto>
{
    public async Task<GetDelivererByIdQueryDto> Handle(
        GetDelivererByIdQuery request, CancellationToken ct)
    {
        var deliverer = await ctx.Deliverers
            .AsNoTracking()
            .Where(x => x.Id == request.Id)
            .Select(x => new GetDelivererByIdQueryDto
            {
                Id = x.Id,
                Name = x.Name,
                Type = x.Type,
                Code = x.Code,
                IsActive = x.IsActive
            })
            .FirstOrDefaultAsync(ct);

        if (deliverer is null)
            throw new MarketNotFoundException($"Deliverer with ID {request.Id} not found.");

        return deliverer;
    }
}
```

---

### Step 7: Create Create Command Files

**Create folder:** `Market.Application/Modules/Delivery/Deliverers/Commands/Create/`

**File 1:** `CreateDelivererCommand.cs`
```csharp
using Market.Domain.Entities.Delivery;

namespace Market.Application.Modules.Delivery.Deliverers.Commands.Create;

public class CreateDelivererCommand : IRequest<int>
{
    public required string Name { get; set; }
    public DelivererType Type { get; set; }
    public required string Code { get; set; }
    public bool IsActive { get; set; } = true;  // Default true as per exam
}
```

**File 2:** `CreateDelivererCommandHandler.cs`

**Copy pattern from:** `CreateProductCategoryCommandHandler.cs`

```csharp
using Market.Domain.Entities.Delivery;

namespace Market.Application.Modules.Delivery.Deliverers.Commands.Create;

public class CreateDelivererCommandHandler(IAppDbContext ctx)
    : IRequestHandler<CreateDelivererCommand, int>
{
    public async Task<int> Handle(CreateDelivererCommand request, CancellationToken ct)
    {
        // Validate Name
        var normalizedName = request.Name?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedName))
            throw new ValidationException("Name is required.");

        // Validate Code
        var normalizedCode = request.Code?.Trim().ToUpper();
        if (string.IsNullOrWhiteSpace(normalizedCode))
            throw new ValidationException("Code is required.");

        if (normalizedCode.Length > 3)
            throw new ValidationException("Code must be maximum 3 characters.");

        // Check if Code is unique
        bool codeExists = await ctx.Deliverers
            .AnyAsync(x => x.Code == normalizedCode, ct);

        if (codeExists)
            throw new MarketConflictException("Code already exists. Code must be unique.");

        var deliverer = new DelivererEntity
        {
            Name = normalizedName,
            Type = request.Type,
            Code = normalizedCode,
            IsActive = request.IsActive
        };

        ctx.Deliverers.Add(deliverer);
        await ctx.SaveChangesAsync(ct);

        return deliverer.Id;
    }
}
```

**WHY:** Validates required fields, checks Code uniqueness, creates entity.

---

### Step 8: Create Update Command Files

**Create folder:** `Market.Application/Modules/Delivery/Deliverers/Commands/Update/`

**File 1:** `UpdateDelivererCommand.cs`
```csharp
using Market.Domain.Entities.Delivery;

namespace Market.Application.Modules.Delivery.Deliverers.Commands.Update;

public class UpdateDelivererCommand : IRequest
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public DelivererType Type { get; set; }
    public required string Code { get; set; }
    public bool IsActive { get; set; }
}
```

**File 2:** `UpdateDelivererCommandHandler.cs`
```csharp
using Market.Domain.Entities.Delivery;

namespace Market.Application.Modules.Delivery.Deliverers.Commands.Update;

public class UpdateDelivererCommandHandler(IAppDbContext ctx)
    : IRequestHandler<UpdateDelivererCommand>
{
    public async Task Handle(UpdateDelivererCommand request, CancellationToken ct)
    {
        var deliverer = await ctx.Deliverers
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct);

        if (deliverer is null)
            throw new MarketNotFoundException($"Deliverer with ID {request.Id} not found.");

        // Validate
        var normalizedName = request.Name?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedName))
            throw new ValidationException("Name is required.");

        var normalizedCode = request.Code?.Trim().ToUpper();
        if (string.IsNullOrWhiteSpace(normalizedCode))
            throw new ValidationException("Code is required.");

        if (normalizedCode.Length > 3)
            throw new ValidationException("Code must be maximum 3 characters.");

        // Check Code uniqueness (excluding current entity)
        bool codeExists = await ctx.Deliverers
            .AnyAsync(x => x.Code == normalizedCode && x.Id != request.Id, ct);

        if (codeExists)
            throw new MarketConflictException("Code already exists.");

        // Update
        deliverer.Name = normalizedName;
        deliverer.Type = request.Type;
        deliverer.Code = normalizedCode;
        deliverer.IsActive = request.IsActive;

        await ctx.SaveChangesAsync(ct);
    }
}
```

---

### Step 9: Create Delete Command Files

**Create folder:** `Market.Application/Modules/Delivery/Deliverers/Commands/Delete/`

**File 1:** `DeleteDelivererCommand.cs`
```csharp
namespace Market.Application.Modules.Delivery.Deliverers.Commands.Delete;

public class DeleteDelivererCommand : IRequest
{
    public int Id { get; set; }
}
```

**File 2:** `DeleteDelivererCommandHandler.cs`
```csharp
namespace Market.Application.Modules.Delivery.Deliverers.Commands.Delete;

public class DeleteDelivererCommandHandler(IAppDbContext ctx)
    : IRequestHandler<DeleteDelivererCommand>
{
    public async Task Handle(DeleteDelivererCommand request, CancellationToken ct)
    {
        var deliverer = await ctx.Deliverers
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct);

        if (deliverer is null)
            throw new MarketNotFoundException($"Deliverer with ID {request.Id} not found.");

        ctx.Deliverers.Remove(deliverer);
        await ctx.SaveChangesAsync(ct);
    }
}
```

---

### Step 10: Create Controller

**Create file:** `Market.API/Controllers/DeliverersController.cs`

**Copy pattern from:** `ProductCategoriesController.cs`

```csharp
using Market.Application.Modules.Delivery.Deliverers.Commands.Create;
using Market.Application.Modules.Delivery.Deliverers.Commands.Delete;
using Market.Application.Modules.Delivery.Deliverers.Commands.Update;
using Market.Application.Modules.Delivery.Deliverers.Queries.GetById;
using Market.Application.Modules.Delivery.Deliverers.Queries.List;

namespace Market.API.Controllers;

[ApiController]
[Route("[controller]")]
public class DeliverersController(ISender sender) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateDelivererCommand command, CancellationToken ct)
    {
        int id = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task Update(int id, UpdateDelivererCommand command, CancellationToken ct)
    {
        command.Id = id;
        await sender.Send(command, ct);
    }

    [HttpDelete("{id:int}")]
    public async Task Delete(int id, CancellationToken ct)
    {
        await sender.Send(new DeleteDelivererCommand { Id = id }, ct);
    }

    [HttpGet("{id:int}")]
    public async Task<GetDelivererByIdQueryDto> GetById(int id, CancellationToken ct)
    {
        return await sender.Send(new GetDelivererByIdQuery { Id = id }, ct);
    }

    [HttpGet]
    public async Task<PageResult<ListDeliverersQueryDto>> List([FromQuery] ListDeliverersQuery query, CancellationToken ct)
    {
        return await sender.Send(query, ct);
    }
}
```

---

### Step 11: Run Migration

In Package Manager Console or terminal:
```bash
dotnet ef migrations add AddDelivererEntity
dotnet ef database update
```

---

## PART 2: FRONTEND

### Step 12: Create API Models

**Create folder:** `src/app/api-services/deliverers/`

**Create file:** `deliverers-api.models.ts`

**Copy pattern from:** `product-categories-api.model.ts`

```typescript
import { BasePagedQuery } from '../../core/models/paging/base-paged-query';
import { PageResult } from '../../core/models/paging/page-result';

// === ENUMS ===

export enum DelivererType {
  External = 1,
  Internal = 2,
  Freelancer = 3
}

// === QUERIES (READ) ===

export class ListDeliverersRequest extends BasePagedQuery {
  search?: string | null;
}

export interface ListDeliverersQueryDto {
  id: number;
  name: string;
  type: DelivererType;
  code: string;
  isActive: boolean;
}

export interface GetDelivererByIdQueryDto {
  id: number;
  name: string;
  type: DelivererType;
  code: string;
  isActive: boolean;
}

export type ListDeliverersResponse = PageResult<ListDeliverersQueryDto>;

// === COMMANDS (WRITE) ===

export interface CreateDelivererCommand {
  name: string;
  type: DelivererType;
  code: string;
  isActive: boolean;
}

export interface UpdateDelivererCommand {
  name: string;
  type: DelivererType;
  code: string;
  isActive: boolean;
}

// === HELPERS ===

export function getDelivererTypeLabel(type: DelivererType): string {
  switch (type) {
    case DelivererType.External: return 'External';
    case DelivererType.Internal: return 'Internal';
    case DelivererType.Freelancer: return 'Freelancer';
    default: return 'Unknown';
  }
}
```

---

### Step 13: Create API Service

**Create file:** `deliverers-api.service.ts`

**Copy pattern from:** `product-categories-api.service.ts`

```typescript
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
} from './deliverers-api.models';
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
```

---

### Step 14: Create List Component

**Create folder:** `src/app/modules/admin/deliverers/`

**Create file:** `deliverers.component.ts`

**Copy pattern from:** `product-categories.component.ts`

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BaseListPagedComponent } from '../../../core/components/base-classes/base-list-paged-component';
import { DeliverersApiService } from '../../../api-services/deliverers/deliverers-api.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { DialogHelperService } from '../../shared/services/dialog-helper.service';
import { DialogButton } from '../../shared/models/dialog-config.model';
import {
  ListDeliverersRequest,
  ListDeliverersQueryDto,
  DelivererType,
  getDelivererTypeLabel
} from '../../../api-services/deliverers/deliverers-api.models';
import { DelivererUpsertComponent } from './deliverer-upsert/deliverer-upsert.component';

@Component({
  selector: 'app-deliverers',
  standalone: false,
  templateUrl: './deliverers.component.html',
  styleUrl: './deliverers.component.scss',
})
export class DeliverersComponent
  extends BaseListPagedComponent<ListDeliverersQueryDto, ListDeliverersRequest>
  implements OnInit
{
  private api = inject(DeliverersApiService);
  private dialog = inject(MatDialog);
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
        console.error('Load deliverers error:', err);
      },
    });
  }

  // Search - triggers on Enter key
  onSearch(event: KeyboardEvent, searchTerm: string): void {
    if (event.key === 'Enter') {
      this.request.search = searchTerm || null;
      this.request.paging.page = 1;
      this.loadPagedData();
    }
  }

  // Clear search
  onClearSearch(): void {
    this.request.search = null;
    this.request.paging.page = 1;
    this.loadPagedData();
  }

  // Get type label for display
  getTypeLabel(type: DelivererType): string {
    return getDelivererTypeLabel(type);
  }

  // === CRUD Actions ===

  onCreate(): void {
    const dialogRef = this.dialog.open(DelivererUpsertComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((success: boolean) => {
      if (success) {
        this.toaster.success('Deliverer created successfully');
        this.loadPagedData();
      }
    });
  }

  onEdit(deliverer: ListDeliverersQueryDto): void {
    const dialogRef = this.dialog.open(DelivererUpsertComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        mode: 'edit',
        delivererId: deliverer.id,
      },
    });

    dialogRef.afterClosed().subscribe((success: boolean) => {
      if (success) {
        this.toaster.success('Deliverer updated successfully');
        this.loadPagedData();
      }
    });
  }

  onDelete(deliverer: ListDeliverersQueryDto): void {
    // Show confirmation dialog with name
    this.dialogHelper.showQuestion(
      'Confirm Delete',
      `Are you sure you want to delete "${deliverer.name}"?`
    ).subscribe(result => {
      if (result && result.button === DialogButton.YES) {
        this.performDelete(deliverer);
      }
    });
  }

  private performDelete(deliverer: ListDeliverersQueryDto): void {
    this.startLoading();

    this.api.delete(deliverer.id).subscribe({
      next: () => {
        this.toaster.success('Deliverer deleted successfully');
        this.loadPagedData();
      },
      error: (err) => {
        this.stopLoading();
        this.toaster.error('Failed to delete deliverer');
        console.error('Delete deliverer error:', err);
      },
    });
  }
}
```

---

### Step 15: Create List Component HTML

**Create file:** `deliverers.component.html`

**Copy pattern from:** `product-categories.component.html`

```html
<div class="page-container">
  <div class="page-header">
    <h1>Deliverers</h1>
    <button mat-raised-button color="primary" (click)="onCreate()">
      <mat-icon>add</mat-icon>
      New Deliverer
    </button>
  </div>

  <!-- Search -->
  <div class="search-bar">
    <mat-form-field appearance="outline">
      <mat-label>Search by name</mat-label>
      <input matInput
             #searchInput
             [value]="request.search || ''"
             (keyup)="onSearch($event, searchInput.value)"
             placeholder="Press Enter to search">
      <button mat-icon-button matSuffix (click)="onClearSearch(); searchInput.value = ''"
              *ngIf="request.search">
        <mat-icon>close</mat-icon>
      </button>
    </mat-form-field>
  </div>

  <!-- Loading -->
  <div *ngIf="isLoading" class="loading-container">
    <mat-spinner diameter="40"></mat-spinner>
  </div>

  <!-- Table -->
  <div class="table-container" *ngIf="!isLoading">
    <table mat-table [dataSource]="items" class="mat-elevation-z2">

      <!-- Name Column -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let row">{{ row.name }}</td>
      </ng-container>

      <!-- Type Column -->
      <ng-container matColumnDef="type">
        <th mat-header-cell *matHeaderCellDef>Type</th>
        <td mat-cell *matCellDef="let row">{{ getTypeLabel(row.type) }}</td>
      </ng-container>

      <!-- Code Column -->
      <ng-container matColumnDef="code">
        <th mat-header-cell *matHeaderCellDef>Code</th>
        <td mat-cell *matCellDef="let row">{{ row.code }}</td>
      </ng-container>

      <!-- Is Active Column -->
      <ng-container matColumnDef="isActive">
        <th mat-header-cell *matHeaderCellDef>Active</th>
        <td mat-cell *matCellDef="let row">
          <mat-icon [class.active]="row.isActive" [class.inactive]="!row.isActive">
            {{ row.isActive ? 'check_circle' : 'cancel' }}
          </mat-icon>
        </td>
      </ng-container>

      <!-- Actions Column -->
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let row">
          <button mat-icon-button color="primary" (click)="onEdit(row)" matTooltip="Edit">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="onDelete(row)" matTooltip="Delete">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

      <!-- No data row -->
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell" [attr.colspan]="displayedColumns.length">
          No deliverers found
        </td>
      </tr>
    </table>

    <!-- Pagination -->
    <app-fit-paginator-bar [vm]="this"></app-fit-paginator-bar>
  </div>
</div>
```

---

### Step 16: Create Upsert Dialog Component

**Create folder:** `src/app/modules/admin/deliverers/deliverer-upsert/`

**Create file:** `deliverer-upsert.component.ts`

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeliverersApiService } from '../../../../api-services/deliverers/deliverers-api.service';
import {
  CreateDelivererCommand,
  UpdateDelivererCommand,
  DelivererType
} from '../../../../api-services/deliverers/deliverers-api.models';

interface DialogData {
  mode: 'create' | 'edit';
  delivererId?: number;
}

@Component({
  selector: 'app-deliverer-upsert',
  standalone: false,
  templateUrl: './deliverer-upsert.component.html',
  styleUrl: './deliverer-upsert.component.scss',
})
export class DelivererUpsertComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(DeliverersApiService);
  private dialogRef = inject(MatDialogRef<DelivererUpsertComponent>);
  private data: DialogData = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  isLoading = false;
  isEditMode = false;

  // Enum options for dropdown
  delivererTypes = [
    { value: DelivererType.External, label: 'External' },
    { value: DelivererType.Internal, label: 'Internal' },
    { value: DelivererType.Freelancer, label: 'Freelancer' },
  ];

  ngOnInit(): void {
    this.isEditMode = this.data.mode === 'edit';
    this.initForm();

    if (this.isEditMode && this.data.delivererId) {
      this.loadDeliverer(this.data.delivererId);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      type: [DelivererType.External, [Validators.required]],
      code: ['', [Validators.required, Validators.maxLength(3)]],
      isActive: [true],
    });
  }

  private loadDeliverer(id: number): void {
    this.isLoading = true;
    this.api.getById(id).subscribe({
      next: (deliverer) => {
        this.form.patchValue({
          name: deliverer.name,
          type: deliverer.type,
          code: deliverer.code,
          isActive: deliverer.isActive,
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Load deliverer error:', err);
        this.isLoading = false;
        this.dialogRef.close(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.isEditMode) {
      this.updateDeliverer();
    } else {
      this.createDeliverer();
    }
  }

  private createDeliverer(): void {
    const command: CreateDelivererCommand = {
      name: this.form.value.name,
      type: this.form.value.type,
      code: this.form.value.code.toUpperCase(),
      isActive: this.form.value.isActive,
    };

    this.api.create(command).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Create deliverer error:', err);
        this.isLoading = false;
      },
    });
  }

  private updateDeliverer(): void {
    const command: UpdateDelivererCommand = {
      name: this.form.value.name,
      type: this.form.value.type,
      code: this.form.value.code.toUpperCase(),
      isActive: this.form.value.isActive,
    };

    this.api.update(this.data.delivererId!, command).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Update deliverer error:', err);
        this.isLoading = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Helper for template
  get title(): string {
    return this.isEditMode ? 'Edit Deliverer' : 'New Deliverer';
  }
}
```

---

### Step 17: Create Upsert Dialog HTML

**Create file:** `deliverer-upsert.component.html`

```html
<h2 mat-dialog-title>{{ title }}</h2>

<mat-dialog-content>
  <form [formGroup]="form" class="deliverer-form">

    <!-- Name -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Name</mat-label>
      <input matInput formControlName="name" placeholder="Enter name">
      <mat-error *ngIf="form.get('name')?.hasError('required')">
        Name is required
      </mat-error>
    </mat-form-field>

    <!-- Type -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Type</mat-label>
      <mat-select formControlName="type">
        <mat-option *ngFor="let type of delivererTypes" [value]="type.value">
          {{ type.label }}
        </mat-option>
      </mat-select>
      <mat-error *ngIf="form.get('type')?.hasError('required')">
        Type is required
      </mat-error>
    </mat-form-field>

    <!-- Code -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Code</mat-label>
      <input matInput formControlName="code" placeholder="Max 3 characters" maxlength="3"
             style="text-transform: uppercase;">
      <mat-hint>Unique code, max 3 alphanumeric characters</mat-hint>
      <mat-error *ngIf="form.get('code')?.hasError('required')">
        Code is required
      </mat-error>
      <mat-error *ngIf="form.get('code')?.hasError('maxlength')">
        Code must be max 3 characters
      </mat-error>
    </mat-form-field>

    <!-- Is Active -->
    <mat-checkbox formControlName="isActive">
      Active
    </mat-checkbox>

  </form>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button (click)="onCancel()">Cancel</button>
  <button mat-raised-button color="primary"
          (click)="onSubmit()"
          [disabled]="form.invalid || isLoading">
    {{ isEditMode ? 'Save' : 'Create' }}
  </button>
</mat-dialog-actions>
```

---

### Step 18: Create Component SCSS Files

**Create file:** `deliverers.component.scss`
```scss
.page-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.active {
  color: green;
}

.inactive {
  color: red;
}
```

**Create file:** `deliverer-upsert.component.scss`
```scss
.deliverer-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 300px;
}

.full-width {
  width: 100%;
}
```

---

### Step 19: Register Components in Admin Module

**Modify file:** `admin-module.ts`

**Add imports at top:**
```typescript
import { DeliverersComponent } from './deliverers/deliverers.component';
import { DelivererUpsertComponent } from './deliverers/deliverer-upsert/deliverer-upsert.component';
```

**Add to declarations array:**
```typescript
declarations: [
  // ... existing
  DeliverersComponent,
  DelivererUpsertComponent,
],
```

---

### Step 20: Add Route

**Modify file:** `admin-routing-module.ts`

**Add import:**
```typescript
import { DeliverersComponent } from './deliverers/deliverers.component';
```

**Add route in children array:**
```typescript
{
  path: 'deliverers',
  component: DeliverersComponent,
},
```

---

### Step 21: Add Sidebar Menu Item

**Modify file:** `admin-layout.component.html`

**Add menu item** (find the navigation section and add):

```html
<!-- DELIVERIES SECTION -->
<div class="nav-section-title">
  Deliveries
</div>

<a mat-list-item routerLink="/admin/deliverers" routerLinkActive="active">
  <mat-icon matListItemIcon>local_shipping</mat-icon>
  <span matListItemTitle>Deliverers</span>
</a>
```

---

## TESTING CHECKLIST

1. [ ] Backend builds without errors
2. [ ] Frontend builds without errors (`npm start`)
3. [ ] Navigate to /admin/deliverers - list shows
4. [ ] Click "New Deliverer" - dialog opens
5. [ ] Fill form and save - toast shows success, list refreshes
6. [ ] Click Edit - dialog shows existing data
7. [ ] Update and save - toast shows success
8. [ ] Click Delete - confirmation dialog appears with name
9. [ ] Confirm delete - toast shows success, list refreshes
10. [ ] Search by name - press Enter, list filters
11. [ ] Pagination works - navigate pages
12. [ ] Code uniqueness - try duplicate code, get error

---

## COPY-PASTE REFERENCE TABLE

| What you need | Copy from |
|--------------|-----------|
| Entity structure | `ProductCategoryEntity.cs` |
| Controller | `ProductCategoriesController.cs` |
| List Query Handler | `ListProductCategoriesQueryHandler.cs` |
| Create Command Handler | `CreateProductCategoryCommandHandler.cs` |
| API Service | `product-categories-api.service.ts` |
| API Models | `product-categories-api.model.ts` |
| List Component | `product-categories.component.ts` |
| List HTML | `product-categories.component.html` |
| Upsert Dialog | `product-category-upsert.component.ts` |
