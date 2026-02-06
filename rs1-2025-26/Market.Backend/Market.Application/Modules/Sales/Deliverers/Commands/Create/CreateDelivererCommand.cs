namespace Market.Application.Modules.Sales.Deliverers.Commands.Create;

using Market.Domain.Enums;

public class CreateDelivererCommand : IRequest<int>
{
    public required string Name { get; set; }
    public required DelivererType Type { get; set; }
    public required string Code { get; set; }
    public bool IsActive { get; set; } = true;
}