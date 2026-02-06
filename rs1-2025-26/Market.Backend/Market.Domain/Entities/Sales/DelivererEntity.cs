using Market.Domain.Common;
using Market.Domain.Enums;

namespace Market.Domain.Entities.Sales;

public class DelivererEntity : BaseEntity
{
    public required string Name { get; set; }
    public required DelivererType Type { get; set; }
    public required string Code { get; set; }
    public bool IsActive { get; set; }

    public static class Constraints
    {
        public const int NameMaxLength = 100;
        public const int CodeMaxLength = 3;
    }
}
