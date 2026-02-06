namespace Market.Application.Modules.Sales.Deliverers.Commands.Update;

using Market.Domain.Enums;

public class UpdateDelivererCommand : IRequest
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required DelivererType Type { get; set; }
    public required string Code { get; set; }
    public bool IsActive { get; set; }
}