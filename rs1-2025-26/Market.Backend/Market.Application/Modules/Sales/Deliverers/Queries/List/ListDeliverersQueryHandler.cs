namespace Market.Application.Modules.Sales.Deliverers.Queries.List;

using Market.Domain.Entities.Sales;
using Market.Domain.Enums;

public sealed class ListDeliverersQueryHandler(IAppDbContext ctx)
    : IRequestHandler<ListDeliverersQuery, PageResult<ListDeliverersQueryDto>>
{
    public async Task<PageResult<ListDeliverersQueryDto>> Handle(
        ListDeliverersQuery request, CancellationToken ct)
    {
        var q = ctx.Deliverers.AsNoTracking();

        // Case-insensitive search
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

        return await PageResult<ListDeliverersQueryDto>
            .FromQueryableAsync(projectedQuery, request.Paging, ct);
    }
}