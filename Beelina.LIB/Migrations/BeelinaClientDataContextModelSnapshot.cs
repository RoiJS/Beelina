﻿// <auto-generated />
using System;
using Beelina.LIB.DbContexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Beelina.LIB.Migrations
{
    [DbContext(typeof(BeelinaClientDataContext))]
    partial class BeelinaClientDataContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.12")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder, 1L, 1);

            modelBuilder.Entity("Beelina.LIB.Models.RefreshToken", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"), 1L, 1);

                    b.Property<DateTime>("DateCreated")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("DateDeactivated")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("DateDeleted")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("DateUpdated")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("ExpirationDate")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<bool>("IsDelete")
                        .HasColumnType("bit");

                    b.Property<string>("Token")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("UserAccountId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserAccountId");

                    b.ToTable("RefreshTokens");
                });

            modelBuilder.Entity("Beelina.LIB.Models.UserAccount", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"), 1L, 1);

                    b.Property<int?>("CreatedById")
                        .HasColumnType("int");

                    b.Property<DateTime>("DateCreated")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("DateDeactivated")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("DateDeleted")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("DateUpdated")
                        .HasColumnType("datetime2");

                    b.Property<int?>("DeactivatedById")
                        .HasColumnType("int");

                    b.Property<int?>("DeletedById")
                        .HasColumnType("int");

                    b.Property<string>("EmailAddress")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("FirstName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Gender")
                        .HasColumnType("int");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<bool>("IsDelete")
                        .HasColumnType("bit");

                    b.Property<string>("LastName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("MiddleName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<byte[]>("PasswordHash")
                        .HasColumnType("varbinary(max)");

                    b.Property<byte[]>("PasswordSalt")
                        .HasColumnType("varbinary(max)");

                    b.Property<string>("PhotoUrl")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("UpdatedById")
                        .HasColumnType("int");

                    b.Property<string>("Username")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("CreatedById");

                    b.HasIndex("DeactivatedById");

                    b.HasIndex("DeletedById");

                    b.HasIndex("UpdatedById");

                    b.ToTable("UserAccounts");
                });

            modelBuilder.Entity("Beelina.LIB.Models.UserPermission", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"), 1L, 1);

                    b.Property<DateTime>("DateCreated")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("DateDeactivated")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("DateDeleted")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("DateUpdated")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<bool>("IsDelete")
                        .HasColumnType("bit");

                    b.Property<int>("ModuleId")
                        .HasColumnType("int");

                    b.Property<int>("PermissionLevel")
                        .HasColumnType("int");

                    b.Property<int>("UserAccountId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserAccountId");

                    b.ToTable("UserPermission");
                });

            modelBuilder.Entity("Beelina.LIB.Models.RefreshToken", b =>
                {
                    b.HasOne("Beelina.LIB.Models.UserAccount", "UserAccount")
                        .WithMany("RefreshTokens")
                        .HasForeignKey("UserAccountId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("FK_RefreshToken_UserAccounts_AccountId");

                    b.Navigation("UserAccount");
                });

            modelBuilder.Entity("Beelina.LIB.Models.UserAccount", b =>
                {
                    b.HasOne("Beelina.LIB.Models.UserAccount", "CreatedBy")
                        .WithMany("CreatedAccounts")
                        .HasForeignKey("CreatedById")
                        .HasConstraintName("FK_UserAccounts_CreatedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "DeactivatedBy")
                        .WithMany("DeactivatedAccounts")
                        .HasForeignKey("DeactivatedById")
                        .HasConstraintName("FK_UserAccounts_DeactivatedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "DeletedBy")
                        .WithMany("DeletedAccounts")
                        .HasForeignKey("DeletedById")
                        .HasConstraintName("FK_UserAccounts_DeletedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "UpdatedBy")
                        .WithMany("UpdatedAccounts")
                        .HasForeignKey("UpdatedById")
                        .HasConstraintName("FK_UserAccounts_UpdatedById_Accounts_AccountId");

                    b.Navigation("CreatedBy");

                    b.Navigation("DeactivatedBy");

                    b.Navigation("DeletedBy");

                    b.Navigation("UpdatedBy");
                });

            modelBuilder.Entity("Beelina.LIB.Models.UserPermission", b =>
                {
                    b.HasOne("Beelina.LIB.Models.UserAccount", "UserAccount")
                        .WithMany()
                        .HasForeignKey("UserAccountId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("UserAccount");
                });

            modelBuilder.Entity("Beelina.LIB.Models.UserAccount", b =>
                {
                    b.Navigation("CreatedAccounts");

                    b.Navigation("DeactivatedAccounts");

                    b.Navigation("DeletedAccounts");

                    b.Navigation("RefreshTokens");

                    b.Navigation("UpdatedAccounts");
                });
#pragma warning restore 612, 618
        }
    }
}
