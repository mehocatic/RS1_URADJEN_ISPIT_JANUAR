namespace Market.Application.Modules.Sales.Deliverers.Commands.Delete;

public class DeleteDelivererCommand : IRequest
{
    public required int Id { get; set; }
}