namespace Market.Application.Modules.Sales.Deliverers.Commands.Create;

using Market.Domain.Entities.Sales;
using Market.Domain.Enums;

public class CreateDelivererCommandHandler(IAppDbContext context)
    : IRequestHandler<CreateDelivererCommand, int>
{
    public async Task<int> Handle(CreateDelivererCommand request, CancellationToken ct)
    {
        // Normalize input
        var normalizedCode = request.Code?.Trim().ToUpperInvariant();

        // Check for duplicate code
        bool codeExists = await context.Deliverers
            .AnyAsync(x => x.Code == normalizedCode, ct);

        if (codeExists)
        {
            throw new MarketConflictException("Code already exists.");
        }

        var deliverer = new DelivererEntity
        {
            Name = request.Name.Trim(),
            Type = request.Type,
            Code = normalizedCode!,
            IsActive = request.IsActive
        };

        context.Deliverers.Add(deliverer);
        await context.SaveChangesAsync(ct);

        return deliverer.Id;
    }
}