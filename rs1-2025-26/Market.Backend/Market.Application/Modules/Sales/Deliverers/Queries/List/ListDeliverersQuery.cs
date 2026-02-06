namespace Market.Application.Modules.Sales.Deliverers.Queries.List;

public sealed class ListDeliverersQuery : BasePagedQuery<ListDeliverersQueryDto>
{
    public string? Search { get; init; }
}