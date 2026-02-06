namespace Market.Application.Modules.Sales.Deliverers.Commands.Delete;

using Market.Domain.Entities.Sales;

public class DeleteDelivererCommandHandler(IAppDbContext context)
    : IRequestHandler<DeleteDelivererCommand>
{
    public async Task Handle(DeleteDelivererCommand request, CancellationToken ct)
    {
        var deliverer = await context.Deliverers
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new MarketNotFoundException($"Deliverer with ID {request.Id} not found.");

        context.Deliverers.Remove(deliverer);
        await context.SaveChangesAsync(ct);
    }
}