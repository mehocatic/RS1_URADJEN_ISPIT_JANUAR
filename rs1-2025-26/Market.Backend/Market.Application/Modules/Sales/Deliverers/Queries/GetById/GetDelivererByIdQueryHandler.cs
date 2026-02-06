namespace Market.Application.Modules.Sales.Deliverers.Queries.GetById;

using Market.Domain.Entities.Sales;
using Market.Domain.Enums;

public sealed class GetDelivererByIdQueryHandler(IAppDbContext ctx)
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
            .FirstOrDefaultAsync(ct)
            ?? throw new MarketNotFoundException($"Deliverer with ID {request.Id} not found.");

        return deliverer;
    }
}