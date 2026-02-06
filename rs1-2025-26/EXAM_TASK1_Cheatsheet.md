# EXAM Task 1: Deliverer CRUD - One-Line Cheatsheet

## BACKEND STEPS

1. Create `DelivererType.cs` enum in `Market.Domain/Entities/Delivery/` with values External=1, Internal=2, Freelancer=3.
2. Create `DelivererEntity.cs` in same folder with properties: Name, Type, Code, IsActive (copy from ProductCategoryEntity).
3. Add `DbSet<DelivererEntity> Deliverers => Set<DelivererEntity>();` to DatabaseContext.cs.
4. Add `DbSet<DelivererEntity> Deliverers { get; }` to IAppDbContext.cs interface.
5. Create folder `Market.Application/Modules/Delivery/Deliverers/Queries/List/` for list query files.
6. Create `ListDeliverersQuery.cs` extending BasePagedQuery with Search property.
7. Create `ListDeliverersQueryDto.cs` with Id, Name, Type, Code, IsActive properties.
8. Create `ListDeliverersQueryHandler.cs` with search filter using ToLower().Contains() for case-insensitive search.
9. Create folder `Queries/GetById/` with GetDelivererByIdQuery, Dto, and Handler files.
10. Create folder `Commands/Create/` with CreateDelivererCommand (Name, Type, Code, IsActive) and Handler with Code uniqueness check.
11. Create folder `Commands/Update/` with UpdateDelivererCommand and Handler checking Code uniqueness excluding current Id.
12. Create folder `Commands/Delete/` with DeleteDelivererCommand and Handler that removes entity.
13. Create `DeliverersController.cs` in Market.API/Controllers with Create, Update, Delete, GetById, List endpoints (copy from ProductCategoriesController).
14. Run `dotnet ef migrations add AddDelivererEntity` then `dotnet ef database update`.

## FRONTEND STEPS

15. Create folder `src/app/api-services/deliverers/` for API files.
16. Create `deliverers-api.models.ts` with DelivererType enum, Request/Response classes, Command interfaces (copy from product-categories-api.model.ts).
17. Create `deliverers-api.service.ts` with list, getById, create, update, delete methods (copy from product-categories-api.service.ts).
18. Create folder `src/app/modules/admin/deliverers/` for components.
19. Create `deliverers.component.ts` extending BaseListPagedComponent with CRUD methods and search on Enter key.
20. Create `deliverers.component.html` with table showing Name, Type, Code, IsActive columns and Edit/Delete action buttons.
21. Create folder `deliverers/deliverer-upsert/` for dialog component.
22. Create `deliverer-upsert.component.ts` with Reactive Forms (FormBuilder, Validators.required, Validators.maxLength(3)).
23. Create `deliverer-upsert.component.html` with form fields: name input, type dropdown, code input, isActive checkbox.
24. Add DeliverersComponent and DelivererUpsertComponent to admin-module.ts declarations array.
25. Add route `{ path: 'deliverers', component: DeliverersComponent }` to admin-routing-module.ts.
26. Add sidebar menu item with `routerLink="/admin/deliverers"` and local_shipping icon to admin-layout.component.html.

## KEY VALIDATION RULES

27. Name field: required on both backend and frontend.
28. Type field: required, use mat-select dropdown with enum options.
29. Code field: required, max 3 characters, must be unique (check with AnyAsync excluding current Id on update).
30. IsActive field: default true on create.
31. Search: case-insensitive, triggers on Enter key, resets page to 1.
32. Delete: show confirmation modal with "Are you sure you want to delete {name}?" before deleting.
33. Toast messages: show success/error after every CRUD action.
34. Pagination: use app-fit-paginator-bar component with [vm]="this".

## COPY-PASTE QUICK REFERENCE

| Need             | Copy from file                                   |
| ---------------- | ------------------------------------------------ |
| Entity           | `ProductCategoryEntity.cs`                       |
| Controller       | `ProductCategoriesController.cs`                 |
| Query Handler    | `ListProductCategoriesQueryHandler.cs`           |
| Create Handler   | `CreateProductCategoryCommandHandler.cs`         |
| API Service      | `product-categories-api.service.ts`              |
| API Models       | `product-categories-api.model.ts`                |
| List Component   | `product-categories.component.ts` + `.html`      |
| Dialog Component | `product-category-upsert.component.ts` + `.html` |

## FIND & REPLACE PATTERN

When copying ProductCategory files, replace:

- `ProductCategory` → `Deliverer`
- `productCategory` → `deliverer`
- `product-category` → `deliverer`
- `PRODUCT_CATEGORY` → `DELIVERER`
- `categories` → `deliverers`
- `category` → `deliverer`
