namespace Market.Application.Modules.Sales.Deliverers.Queries.GetById;

using Market.Domain.Enums;

public sealed class GetDelivererByIdQueryDto
{
    public required int Id { get; init; }
    public required string Name { get; init; }
    public required DelivererType Type { get; init; }
    public required string Code { get; init; }
    public required bool IsActive { get; init; }
}