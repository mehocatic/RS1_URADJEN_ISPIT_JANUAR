using Market.Application.Modules.Sales.Deliverers.Commands.Create;
using Market.Application.Modules.Sales.Deliverers.Commands.Update;
using Market.Application.Modules.Sales.Deliverers.Commands.Delete;
using Market.Application.Modules.Sales.Deliverers.Queries.GetById;
using Market.Application.Modules.Sales.Deliverers.Queries.List;

namespace Market.API.Controllers;

[ApiController]
[Route("[controller]")]
public class DeliverersController(ISender sender) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<int>> Create(
        CreateDelivererCommand command, CancellationToken ct)
    {
        int id = await sender.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:int}")]
    public async Task Update(int id, UpdateDelivererCommand command, CancellationToken ct)
    {
        command.Id = id;
        await sender.Send(command, ct);
    }

    [HttpDelete("{id:int}")]
    public async Task Delete(int id, CancellationToken ct)
    {
        await sender.Send(new DeleteDelivererCommand { Id = id }, ct);
    }

    [HttpGet("{id:int}")]
    public async Task<GetDelivererByIdQueryDto> GetById(int id, CancellationToken ct)
    {
        return await sender.Send(new GetDelivererByIdQuery { Id = id }, ct);
    }

    [HttpGet]
    public async Task<PageResult<ListDeliverersQueryDto>> List(
        [FromQuery] ListDeliverersQuery query, CancellationToken ct)
    {
        return await sender.Send(query, ct);
    }
}