﻿// <auto-generated />
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
    [Migration("20231114193633_AlterDailySummarizeTransactionsStoredProcedure_20231115836")]
    partial class AlterDailySummarizeTransactionsStoredProcedure_20231115836
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.12")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder, 1L, 1);

            modelBuilder.Entity("Beelina.LIB.Models.Barangay", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"), 1L, 1);

                    b.Property<string>("Code")
                        .HasColumnType("nvarchar(max)");

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

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("UserAccountId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserAccountId");

                    b.ToTable("Barangays");
                });

            modelBuilder.Entity("Beelina.LIB.Models.PaymentMethod", b =>
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

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("PaymentMethods");
                });

            modelBuilder.Entity("Beelina.LIB.Models.Product", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"), 1L, 1);

                    b.Property<string>("Code")
                        .HasColumnType("nvarchar(max)");

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

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<bool>("IsDelete")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<float>("PricePerUnit")
                        .HasColumnType("real");

                    b.Property<int>("ProductUnitId")
                        .HasColumnType("int");

                    b.Property<int>("StockQuantity")
                        .HasColumnType("int");

                    b.Property<int?>("UpdatedById")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("CreatedById");

                    b.HasIndex("DeactivatedById");

                    b.HasIndex("DeletedById");

                    b.HasIndex("ProductUnitId");

                    b.HasIndex("UpdatedById");

                    b.ToTable("Products");
                });

            modelBuilder.Entity("Beelina.LIB.Models.ProductStockPerPanel", b =>
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

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<bool>("IsDelete")
                        .HasColumnType("bit");

                    b.Property<float>("PricePerUnit")
                        .HasColumnType("real");

                    b.Property<int>("ProductId")
                        .HasColumnType("int");

                    b.Property<int>("StockQuantity")
                        .HasColumnType("int");

                    b.Property<int?>("UpdatedById")
                        .HasColumnType("int");

                    b.Property<int>("UserAccountId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("CreatedById");

                    b.HasIndex("DeactivatedById");

                    b.HasIndex("DeletedById");

                    b.HasIndex("ProductId");

                    b.HasIndex("UpdatedById");

                    b.HasIndex("UserAccountId");

                    b.ToTable("ProductStockPerPanels");
                });

            modelBuilder.Entity("Beelina.LIB.Models.ProductTransaction", b =>
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

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<bool>("IsDelete")
                        .HasColumnType("bit");

                    b.Property<double>("Price")
                        .HasColumnType("float");

                    b.Property<int>("ProductId")
                        .HasColumnType("int");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<int>("TransactionId")
                        .HasColumnType("int");

                    b.Property<int?>("UpdatedById")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("CreatedById");

                    b.HasIndex("DeactivatedById");

                    b.HasIndex("DeletedById");

                    b.HasIndex("ProductId");

                    b.HasIndex("TransactionId");

                    b.HasIndex("UpdatedById");

                    b.ToTable("ProductTransactions");
                });

            modelBuilder.Entity("Beelina.LIB.Models.ProductUnit", b =>
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

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<bool>("IsDelete")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("ProductUnits");
                });

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

            modelBuilder.Entity("Beelina.LIB.Models.Store", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"), 1L, 1);

                    b.Property<string>("Address")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("BarangayId")
                        .HasColumnType("int");

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

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<bool>("IsDelete")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("OutletType")
                        .HasColumnType("int");

                    b.Property<int>("PaymentMethodId")
                        .HasColumnType("int");

                    b.Property<int?>("UpdatedById")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("BarangayId");

                    b.HasIndex("CreatedById");

                    b.HasIndex("DeactivatedById");

                    b.HasIndex("DeletedById");

                    b.HasIndex("PaymentMethodId");

                    b.HasIndex("UpdatedById");

                    b.ToTable("Stores");
                });

            modelBuilder.Entity("Beelina.LIB.Models.Transaction", b =>
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

                    b.Property<double>("Discount")
                        .HasColumnType("float");

                    b.Property<string>("InvoiceNo")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<bool>("IsDelete")
                        .HasColumnType("bit");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<int>("StoreId")
                        .HasColumnType("int");

                    b.Property<DateTime>("TransactionDate")
                        .HasColumnType("datetime2");

                    b.Property<int?>("UpdatedById")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("CreatedById");

                    b.HasIndex("DeactivatedById");

                    b.HasIndex("DeletedById");

                    b.HasIndex("StoreId");

                    b.HasIndex("UpdatedById");

                    b.ToTable("Transactions");
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

            modelBuilder.Entity("Beelina.LIB.Models.Barangay", b =>
                {
                    b.HasOne("Beelina.LIB.Models.UserAccount", "UserAccount")
                        .WithMany()
                        .HasForeignKey("UserAccountId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("UserAccount");
                });

            modelBuilder.Entity("Beelina.LIB.Models.Product", b =>
                {
                    b.HasOne("Beelina.LIB.Models.UserAccount", "CreatedBy")
                        .WithMany("CreatedProducts")
                        .HasForeignKey("CreatedById")
                        .HasConstraintName("FK_Product_CreatedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "DeactivatedBy")
                        .WithMany("DeactivatedProducts")
                        .HasForeignKey("DeactivatedById")
                        .HasConstraintName("FK_Product_DeactivatedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "DeletedBy")
                        .WithMany("DeletedProducts")
                        .HasForeignKey("DeletedById")
                        .HasConstraintName("FK_Product_DeletedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.ProductUnit", "ProductUnit")
                        .WithMany()
                        .HasForeignKey("ProductUnitId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Beelina.LIB.Models.UserAccount", "UpdatedBy")
                        .WithMany("UpdatedProducts")
                        .HasForeignKey("UpdatedById")
                        .HasConstraintName("FK_Product_UpdatedById_Accounts_AccountId");

                    b.Navigation("CreatedBy");

                    b.Navigation("DeactivatedBy");

                    b.Navigation("DeletedBy");

                    b.Navigation("ProductUnit");

                    b.Navigation("UpdatedBy");
                });

            modelBuilder.Entity("Beelina.LIB.Models.ProductStockPerPanel", b =>
                {
                    b.HasOne("Beelina.LIB.Models.UserAccount", "CreatedBy")
                        .WithMany()
                        .HasForeignKey("CreatedById");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "DeactivatedBy")
                        .WithMany()
                        .HasForeignKey("DeactivatedById");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "DeletedBy")
                        .WithMany()
                        .HasForeignKey("DeletedById");

                    b.HasOne("Beelina.LIB.Models.Product", "Product")
                        .WithMany()
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Beelina.LIB.Models.UserAccount", "UpdatedBy")
                        .WithMany()
                        .HasForeignKey("UpdatedById");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "UserAccount")
                        .WithMany()
                        .HasForeignKey("UserAccountId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("CreatedBy");

                    b.Navigation("DeactivatedBy");

                    b.Navigation("DeletedBy");

                    b.Navigation("Product");

                    b.Navigation("UpdatedBy");

                    b.Navigation("UserAccount");
                });

            modelBuilder.Entity("Beelina.LIB.Models.ProductTransaction", b =>
                {
                    b.HasOne("Beelina.LIB.Models.UserAccount", "CreatedBy")
                        .WithMany("CreatedProductTransactions")
                        .HasForeignKey("CreatedById")
                        .HasConstraintName("FK_ProductTransaction_CreatedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "DeactivatedBy")
                        .WithMany("DeactivatedProductTransactions")
                        .HasForeignKey("DeactivatedById")
                        .HasConstraintName("FK_ProductTransaction_DeactivatedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "DeletedBy")
                        .WithMany("DeletedProductTransactions")
                        .HasForeignKey("DeletedById")
                        .HasConstraintName("FK_ProductTransaction_DeletedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.Product", "Product")
                        .WithMany()
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Beelina.LIB.Models.Transaction", "Transaction")
                        .WithMany("ProductTransactions")
                        .HasForeignKey("TransactionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Beelina.LIB.Models.UserAccount", "UpdatedBy")
                        .WithMany("UpdatedProductTransactions")
                        .HasForeignKey("UpdatedById")
                        .HasConstraintName("FK_ProductTransaction_UpdatedById_Accounts_AccountId");

                    b.Navigation("CreatedBy");

                    b.Navigation("DeactivatedBy");

                    b.Navigation("DeletedBy");

                    b.Navigation("Product");

                    b.Navigation("Transaction");

                    b.Navigation("UpdatedBy");
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

            modelBuilder.Entity("Beelina.LIB.Models.Store", b =>
                {
                    b.HasOne("Beelina.LIB.Models.Barangay", "Barangay")
                        .WithMany("Stores")
                        .HasForeignKey("BarangayId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Beelina.LIB.Models.UserAccount", "CreatedBy")
                        .WithMany("CreatedStores")
                        .HasForeignKey("CreatedById")
                        .HasConstraintName("FK_Store_CreatedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "DeactivatedBy")
                        .WithMany("DeactivatedStores")
                        .HasForeignKey("DeactivatedById")
                        .HasConstraintName("FK_Store_DeactivatedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "DeletedBy")
                        .WithMany("DeletedStores")
                        .HasForeignKey("DeletedById")
                        .HasConstraintName("FK_Store_DeletedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.PaymentMethod", "PaymentMethod")
                        .WithMany()
                        .HasForeignKey("PaymentMethodId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Beelina.LIB.Models.UserAccount", "UpdatedBy")
                        .WithMany("UpdatedStores")
                        .HasForeignKey("UpdatedById")
                        .HasConstraintName("FK_Store_UpdatedById_Accounts_AccountId");

                    b.Navigation("Barangay");

                    b.Navigation("CreatedBy");

                    b.Navigation("DeactivatedBy");

                    b.Navigation("DeletedBy");

                    b.Navigation("PaymentMethod");

                    b.Navigation("UpdatedBy");
                });

            modelBuilder.Entity("Beelina.LIB.Models.Transaction", b =>
                {
                    b.HasOne("Beelina.LIB.Models.UserAccount", "CreatedBy")
                        .WithMany("CreatedTransactions")
                        .HasForeignKey("CreatedById")
                        .HasConstraintName("FK_Transaction_CreatedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "DeactivatedBy")
                        .WithMany("DeactivatedTransactions")
                        .HasForeignKey("DeactivatedById")
                        .HasConstraintName("FK_Transaction_DeactivatedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.UserAccount", "DeletedBy")
                        .WithMany("DeletedTransactions")
                        .HasForeignKey("DeletedById")
                        .HasConstraintName("FK_Transaction_DeletedById_Accounts_AccountId");

                    b.HasOne("Beelina.LIB.Models.Store", "Store")
                        .WithMany("Transactions")
                        .HasForeignKey("StoreId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Beelina.LIB.Models.UserAccount", "UpdatedBy")
                        .WithMany("UpdatedTransactions")
                        .HasForeignKey("UpdatedById")
                        .HasConstraintName("FK_Transaction_UpdatedById_Accounts_AccountId");

                    b.Navigation("CreatedBy");

                    b.Navigation("DeactivatedBy");

                    b.Navigation("DeletedBy");

                    b.Navigation("Store");

                    b.Navigation("UpdatedBy");
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
                        .WithMany("UserPermissions")
                        .HasForeignKey("UserAccountId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("UserAccount");
                });

            modelBuilder.Entity("Beelina.LIB.Models.Barangay", b =>
                {
                    b.Navigation("Stores");
                });

            modelBuilder.Entity("Beelina.LIB.Models.Store", b =>
                {
                    b.Navigation("Transactions");
                });

            modelBuilder.Entity("Beelina.LIB.Models.Transaction", b =>
                {
                    b.Navigation("ProductTransactions");
                });

            modelBuilder.Entity("Beelina.LIB.Models.UserAccount", b =>
                {
                    b.Navigation("CreatedAccounts");

                    b.Navigation("CreatedProductTransactions");

                    b.Navigation("CreatedProducts");

                    b.Navigation("CreatedStores");

                    b.Navigation("CreatedTransactions");

                    b.Navigation("DeactivatedAccounts");

                    b.Navigation("DeactivatedProductTransactions");

                    b.Navigation("DeactivatedProducts");

                    b.Navigation("DeactivatedStores");

                    b.Navigation("DeactivatedTransactions");

                    b.Navigation("DeletedAccounts");

                    b.Navigation("DeletedProductTransactions");

                    b.Navigation("DeletedProducts");

                    b.Navigation("DeletedStores");

                    b.Navigation("DeletedTransactions");

                    b.Navigation("RefreshTokens");

                    b.Navigation("UpdatedAccounts");

                    b.Navigation("UpdatedProductTransactions");

                    b.Navigation("UpdatedProducts");

                    b.Navigation("UpdatedStores");

                    b.Navigation("UpdatedTransactions");

                    b.Navigation("UserPermissions");
                });
#pragma warning restore 612, 618
        }
    }
}
