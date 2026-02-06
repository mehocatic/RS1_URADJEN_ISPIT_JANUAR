namespace Market.Application.Modules.Sales.Deliverers.Queries.GetById;

public class GetDelivererByIdQuery : IRequest<GetDelivererByIdQueryDto>
{
    public required int Id { get; init; }
}