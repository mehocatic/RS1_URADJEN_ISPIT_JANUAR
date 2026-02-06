using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Market.Domain.Entities.Sales;
using Market.Domain.Enums;

namespace Market.Infrastructure.Database.Configurations;

public class DelivererConfiguration: IEntityTypeConfiguration<DelivererEntity>
{
    public void Configure(EntityTypeBuilder<DelivererEntity> builder)
    {
        builder.ToTable("Deliverers");
        builder.HasKey(x=>x.Id);
        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(DelivererEntity.Constraints.NameMaxLength);

        builder.Property(x => x.Code)
            .IsRequired()
            .HasMaxLength(DelivererEntity.Constraints.CodeMaxLength);

        // Unique index on Code (exam requirement)
        builder.HasIndex(x => x.Code)
            .IsUnique();

        builder.Property(x => x.Type)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .HasDefaultValue(true);

    }
}