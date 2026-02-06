namespace Market.Application.Modules.Sales.Deliverers.Queries.List;

using Market.Domain.Enums;

public sealed class ListDeliverersQueryDto
{
    public required int Id { get; init; }
    public required string Name { get; init; }
    public required DelivererType Type { get; init; }
    public required string Code { get; init; }
    public required bool IsActive { get; init; }
}