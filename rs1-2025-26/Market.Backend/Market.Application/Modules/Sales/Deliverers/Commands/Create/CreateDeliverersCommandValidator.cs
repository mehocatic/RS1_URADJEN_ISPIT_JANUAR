namespace Market.Application.Modules.Sales.Deliverers.Commands.Create;

using Market.Domain.Entities.Sales;
using Market.Domain.Enums;
using FluentValidation;

public sealed class CreateDelivererCommandValidator
    : AbstractValidator<CreateDelivererCommand>
{
    public CreateDelivererCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(DelivererEntity.Constraints.NameMaxLength)
            .WithMessage($"Name can be at most {DelivererEntity.Constraints.NameMaxLength} characters.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Code is required.")
            .MaximumLength(DelivererEntity.Constraints.CodeMaxLength)
            .WithMessage($"Code can be at most {DelivererEntity.Constraints.CodeMaxLength} characters.")
            .Matches("^[a-zA-Z0-9]+$").WithMessage("Code must be alphanumeric.");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid deliverer type.");
    }
}