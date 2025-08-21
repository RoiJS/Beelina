using System;
using Beelina.LIB.DbContexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Beelina.LIB.Migrations
{
    [DbContext(typeof(BeelinaClientDataContext))]
    [Migration("20250820065800_IntroducePurchaseOrderReportStoredProcedure")]
    partial class IntroducePurchaseOrderReportStoredProcedure
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            // This migration creates a stored procedure, so no model changes are required
            // The model state remains the same as the previous migration
            
#pragma warning restore 612, 618
        }
    }
}
