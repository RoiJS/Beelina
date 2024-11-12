using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Beelina.LIB.Migrations.BeelinaData
{
    /// <inheritdoc />
    public partial class SetSubscriptionDefaults : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                BEGIN TRANSACTION

                BEGIN TRY
                    -- (1) Set Dashboard Module Defaults
                    IF ((SELECT COUNT(Id) FROM DashboardModules) = 0)
                    BEGIN
                        INSERT INTO DashboardModules ([Name], IsActive, IsDelete, DateCreated, DateUpdated, DateDeleted, DateDeactivated)
                        VALUES 
                        ('Home', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                        , ('Distribution', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                        , ('Insights', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                    END

                    -- (2) Set Dashboard Module Widget Defaults
                    IF ((SELECT COUNT(Id) FROM DashboardModuleWidgets) = 0)
                    BEGIN
                        DECLARE @homeId INT = (SELECT Id FROM DashboardModules WHERE [Name] = 'Home')
                        DECLARE @distributionId INT = (SELECT Id FROM DashboardModules WHERE [Name] = 'Distribution')
                        DECLARE @insightsId INT = (SELECT Id FROM DashboardModules WHERE [Name] = 'Insights')

                        INSERT INTO DashboardModuleWidgets(
                            DashboardModuleId
                            , [Name]
                            , IsActive
                            , IsDelete
                            , DateCreated
                            , DateUpdated
                            , DateDeleted
                            , DateDeactivated
                        ) VALUES (@homeId, 'Sales agents distribution', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                        , (@homeId, 'Sales Date Distribution Chart per month', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                        , (@homeId, 'Sales Date Distribution Chart Filter', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                        , (@distributionId, 'Sales Agent Distribution Data - Sales Agent: Sales', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                        , (@distributionId, 'Sales Agent Distribution Data - Sales Agent: Panel', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                        , (@insightsId, 'Top 10 Selling Products', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                        , (@insightsId, 'Top Customer Sales', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                        , (@insightsId, 'Top Selling Products', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                    END

                    -- (3) Set Subscriptions Default
                    IF ((SELECT COUNT(Id) FROM Subscriptions) = 0)
                    BEGIN
                        INSERT INTO Subscriptions(
                            [Name]
                            , [Description]
                            , IsActive
                            , IsDelete
                            , DateCreated
                            , DateUpdated
                            , DateDeleted
                            , DateDeactivated
                        ) VALUES ('Free Version', 'This is a free version model for Bizual. This only offers limited functionalities.', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                        , ('Premium Version', 'This is a premium version model for Bizual. Clients can take advantage all of the available features that Bizual has.', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                    END

                    
                    -- (4) Set Subscription Features Default
                    IF ((SELECT COUNT(Id) FROM SubscriptionFeatures) = 0)
                    BEGIN

                        DECLARE @freeVersionId INT =  (SELECT Id FROM Subscriptions WHERE [Name] = 'Free Version')
                        DECLARE @premiumVersionId INT =  (SELECT Id FROM Subscriptions WHERE [Name] = 'Premium Version')
                    
                        INSERT INTO SubscriptionFeatures(
                            SubscriptionId
                            , [Version]
                            , [Description]
                            , [Custom]
                            , OfflineModeActive
                            , ProductSKUMax
                            , TopProductsPageActive
                            , CustomerAccountsMax
                            , CustomersMax
                            , DashboardDistributionPageActive
                            , OrderPrintActive
                            , SendReportEmailActive
                            , UserAccountsMax
                            , RegisterUserAddOnActive
                            , CustomReportAddOnActive
                            , IsActive
                            , IsDelete
                            , DateCreated
                            , DateUpdated
                            , DateDeleted
                            , DateDeactivated
                        ) VALUES (@freeVersionId, '1.0', 'Free Version 1.0', 0, 0, 60, 0, 6, 25, 0, 0, 0, 10, 0, 0, 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                        , (@premiumVersionId, '1.0', 'Premium Version 1.0', 0, 1, 0, 1, 0, 0, 1, 1, 1, 10, 1, 1, 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')

                    END

                    DECLARE @freeVersionSubFeatureId INT =  (SELECT Id FROM SubscriptionFeatures WHERE [Description] = 'Free Version 1.0')
                    DECLARE @premiumVersionSubFeatureId INT =  (SELECT Id FROM SubscriptionFeatures WHERE [Description] = 'Premium Version 1.0')

                    -- (5) Set Subscription Features Default
                    IF ((SELECT COUNT(Id) FROM SubscriptionPriceVersions) = 0)
                    BEGIN

                        INSERT INTO SubscriptionPriceVersions(
                            SubscriptionFeatureId
                            , Price
                            , [Date]
                            , IsActive
                            , IsDelete
                            , DateCreated
                            , DateUpdated
                            , DateDeleted
                            , DateDeactivated
                        ) VALUES (@freeVersionSubFeatureId, 0, '2024-01-01', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                        , (@premiumVersionSubFeatureId, 9998.00, '2024-01-01', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                    END

                    -- (6) Set Register User Add on Price Version
                    IF ((SELECT COUNT(Id) FROM SubscriptionRegisterUserAddonPriceVersion) = 0)
                    BEGIN
                        INSERT INTO SubscriptionRegisterUserAddonPriceVersion(
                            SubscriptionFeatureId
                            , Price
                            , [Date]
                            , IsActive
                            , IsDelete
                            , DateCreated
                            , DateUpdated
                            , DateDeleted
                            , DateDeactivated
                        ) VALUES (@premiumVersionSubFeatureId, 299, '2024-01-01', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                    END

                    -- (6) Set Register User Add on Price Version
                    IF ((SELECT COUNT(Id) FROM SubscriptionReportAddonPriceVersions) = 0)
                    BEGIN
                        INSERT INTO SubscriptionReportAddonPriceVersions(
                            SubscriptionFeatureId
                            , Price
                            , [Date]
                            , IsActive
                            , IsDelete
                            , DateCreated
                            , DateUpdated
                            , DateDeleted
                            , DateDeactivated
                        ) VALUES (@premiumVersionSubFeatureId, 250, '2024-01-01', 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                    END


                    -- (7) Set Available Reports 
                    IF ((SELECT COUNT(Id) FROM SubscriptionFeatureAvailableReports) = 0)
                    BEGIN

                        DECLARE @dailyDetailedReportId INT = (SELECT Id FROM Reports WHERE NameTextIdentifier = 'DAILY_DETAILED_TRANSACTIONS_REPORT_NAME')
                        INSERT INTO SubscriptionFeatureAvailableReports(
                            SubscriptionFeatureId
                            , ReportId
                            , IsActive
                            , IsDelete
                            , DateCreated
                            , DateUpdated
                            , DateDeleted
                            , DateDeactivated
                        ) VALUES (@freeVersionSubFeatureId, @dailyDetailedReportId, 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                    END

                    -- (8) Set Available Reports 
                    IF ((SELECT COUNT(Id) FROM SubscriptionFeatureHideDashboardWidgets) = 0)
                    BEGIN

                        DECLARE @salesDistributionWidgetId AS INT = (SELECT Id FROM DashboardModuleWidgets WHERE [Name] = 'Sales agents distribution')

                        INSERT INTO SubscriptionFeatureHideDashboardWidgets(
                            SubscriptionFeatureId
                            , DashboardModuleWidgetId
                            , IsActive
                            , IsDelete
                            , DateCreated
                            , DateUpdated
                            , DateDeleted
                            , DateDeactivated
                        ) VALUES (@freeVersionSubFeatureId, @salesDistributionWidgetId, 1, 0, GETDATE(), '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000', '0001-01-01 00:00:00.0000000')
                    END

                    -- (9) Set Client Subscriptions
                    IF ((SELECT COUNT(Id) FROM ClientSubscriptions) = 0)
                    BEGIN
                        INSERT INTO ClientSubscriptions(
                            ClientId
                            , SubscriptionFeatureId
                            , StartDate
                            , EndDate
                            , IsActive
                            , IsDelete
                            , DateCreated
                            , DateUpdated
                            , DateDeleted
                            , DateDeactivated
                        )	
                        SELECT 
                            Id
                            , @premiumVersionSubFeatureId
                            , GETDATE()
                            , NULL
                            , 1
                            , 0
                            , GETDATE()
                            , '0001-01-01 00:00:00.0000000'
                            , '0001-01-01 00:00:00.0000000'
                            , '0001-01-01 00:00:00.0000000'
                        FROM Clients
                    END

                    COMMIT
                END TRY

                BEGIN CATCH
                    -- Rollback transaction in case of error
                    ROLLBACK
                    -- Output error message
                    DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT
                    SELECT @ErrorMessage = ERROR_MESSAGE(), @ErrorSeverity = ERROR_SEVERITY(), @ErrorState = ERROR_STATE()
                    RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState)
                END CATCH

            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
