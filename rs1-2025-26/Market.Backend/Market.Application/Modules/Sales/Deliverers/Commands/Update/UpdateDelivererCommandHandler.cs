namespace Market.Application.Modules.Sales.Deliverers.Commands.Update;

using Market.Domain.Entities.Sales;
using Market.Domain.Enums;

public class UpdateDelivererCommandHandler(IAppDbContext context)
    : IRequestHandler<UpdateDelivererCommand>
{
    public async Task Handle(UpdateDelivererCommand request, CancellationToken ct)
    {
        var deliverer = await context.Deliverers
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new MarketNotFoundException($"Deliverer with ID {request.Id} not found.");

        var normalizedCode = request.Code.Trim().ToUpperInvariant();

        // Check for duplicate code (excluding current entity)
        bool codeExists = await context.Deliverers
            .AnyAsync(x => x.Code == normalizedCode && x.Id != request.Id, ct);

        if (codeExists)
        {
            throw new MarketConflictException("Code already exists.");
        }

        deliverer.Name = request.Name.Trim();
        deliverer.Type = request.Type;
        deliverer.Code = normalizedCode;
        deliverer.IsActive = request.IsActive;

        await context.SaveChangesAsync(ct);
    }
}