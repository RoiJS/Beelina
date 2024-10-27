using Beelina.API.Types.Mutations;
using Beelina.API.Types.Query;
using Beelina.LIB.GraphQL.Errors;
using Beelina.LIB.GraphQL.Results;

namespace Beelina.API.Helpers.Extensions
{
    public static class ServiceGraphQLExtension
    {

        public static void RegisterGraphQLService(this IServiceCollection services)
        {
            services.AddGraphQLServer()
                .AddAuthorization()
                .AddMutationConventions()
                .AddQueryType(q => q.Name("Query"))
                    .AddProjections()
                    .AddFiltering()
                    .AddSorting()
                .AddMutationType(m => m.Name("Mutation"))
                    .AddType<UserAccountQuery>()
                    .AddType<ClientQuery>()
                    .AddType<ProductQuery>()
                    .AddType<WarehouseProductQuery>()
                    .AddType<ProductUnitQuery>()
                    .AddType<StoreQuery>()
                    .AddType<ReportsQuery>()
                    .AddType<BarangayQuery>()
                    .AddType<PaymentMethodQuery>()
                    .AddType<TransactionQuery>()
                    .AddType<SupplierQuery>()
                    .AddType<SubscriptionQuery>()
                    .AddType<PaymentQuery>()
                    .AddType<GeneralInformationQuery>()
                    .AddType<GeneralSettingsQuery>()
                    .AddType<UserAgentSettingsQuery>()
                    .AddType<UserAccountMutation>()
                    .AddType<BarangayMutation>()
                    .AddType<SupplierMutation>()
                    .AddType<PaymentMutation>()
                    .AddType<ProductMutation>()
                    .AddType<StoreMutation>()
                    .AddType<TransactionMutation>()
                    .AddType<ClientMutation>()
                    .AddType<ReportMutation>()
                    .AddType<LoggerMutation>()
                    .AddType<UserAgentSettingsMutation>()
                    .AddType<ClientInformationResult>()
                    .AddType<ClientSubscriptionDetailsResult>()
                    .AddType<StoreInformationResult>()
                    .AddType<ProductInformationResult>()
                    .AddType<CheckUsernameInformationResult>()
                    .AddType<ReportInformationResult>()
                    .AddType<UserAccountInformationResult>()
                    .AddType<SyncDatabaseResult>()
                    .AddType<StoreNotExistsError>()
                    .AddType<BarangayNotExistsError>()
                    .AddType<ProductFailedRegisterError>()
                    .AddType<ProductCodeExistsError>()
                    .AddType<ProductNotExistsError>()
                    .AddType<ReportNotExistsError>()
                    .AddType<UserAccountNotExistsError>()
                    .AddType<ClientSubscriptionNotExistsError>()
                    .AddType<SystemUpdateActiveError>()
                    .AddType<CheckProductCodeInformationResult>()
                    .AddType<CheckSupplierCodeInformationResult>()
                    .AddType<UploadType>()
                    .AddType<ClientNotExistsError>();
        }
    }
}