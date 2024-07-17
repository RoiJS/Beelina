using Beelina.API.Types.Mutations;
using Beelina.API.Types.Query;
using Beelina.LIB.BusinessLogic;
using Beelina.LIB.DbContexts;
using Beelina.LIB.GraphQL.Errors;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.Helpers.Class;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using ReserbizAPP.LIB.Helpers.Class;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;
var services = builder.Services;

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

#region "Register Services"
services.AddScoped<IDataContextHelper, DataContextHelper>();
services.AddScoped(typeof(IBeelinaRepository<>), typeof(BeelinaRepository<>));
services.AddScoped(typeof(IUserAccountRepository<UserAccount>), typeof(UserAccountRepository));
services.AddScoped(typeof(IClientRepository<Client>), typeof(ClientRepository));
services.AddScoped(typeof(IClientDbManagerRepository<IEntity>), typeof(ClientDbManagerRepository));
services.AddScoped(typeof(IDataSeedRepository<IEntity>), typeof(DataSeedRepository));
services.AddScoped(typeof(ICurrentUserService), typeof(CurrentUserService));
services.AddScoped(typeof(IExtractProductFileService), typeof(ExtractProductFileService));
services.AddScoped(typeof(IProductUnitRepository<ProductUnit>), typeof(ProductUnitRepository));
services.AddScoped(typeof(IProductRepository<Product>), typeof(ProductRepository));
services.AddScoped(typeof(IProductStockPerPanelRepository<ProductStockPerPanel>), typeof(ProductStockPerPanelRepository));
services.AddScoped(typeof(IProductStockPerWarehouseRepository<ProductStockPerWarehouse>), typeof(ProductStockPerWarehouseRepository));
services.AddScoped(typeof(IProductStockAuditRepository<ProductStockAudit>), typeof(ProductStockAuditRepository));
services.AddScoped(typeof(IPaymentMethodRepository<PaymentMethod>), typeof(PaymentMethodRepository));
services.AddScoped(typeof(IRefreshTokenRepository<RefreshToken>), typeof(RefreshTokenRepository));
services.AddScoped(typeof(IStoreRepository<Store>), typeof(StoreRepository));
services.AddScoped(typeof(ITransactionRepository<Transaction>), typeof(TransactionRepository));
services.AddScoped(typeof(IProductTransactionRepository<ProductTransaction>), typeof(ProductTransactionRepository));
services.AddScoped(typeof(IBarangayRepository<Barangay>), typeof(BarangayRepository));
services.AddScoped(typeof(ISupplierRepository<Supplier>), typeof(SupplierRepository));
services.AddScoped(typeof(IPaymentRepository<Payment>), typeof(PaymentRepository));
services.AddScoped(typeof(IReportRepository<Report>), typeof(ReportRepository));
services.AddScoped(typeof(IGeneralInformationRepository<GeneralInformation>), typeof(GeneralInformationRepository));
services.AddScoped(typeof(IGeneralSettingRepository<GeneralSetting>), typeof(GeneralSettingRepository));
services.AddTransient<ClaimsPrincipal>(s => s.GetService<IHttpContextAccessor>().HttpContext.User);

// GraphQL Services
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
        .AddType<PaymentQuery>()
        .AddType<GeneralInformationQuery>()
        .AddType<UserAccountMutation>()
        .AddType<BarangayMutation>()
        .AddType<SupplierMutation>()
        .AddType<PaymentMutation>()
        .AddType<ProductMutation>()
        .AddType<StoreMutation>()
        .AddType<TransactionMutation>()
        .AddType<ClientMutation>()
        .AddType<ReportMutation>()
        .AddType<ClientInformationResult>()
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
        .AddType<SystemUpdateActiveError>()
        .AddType<CheckProductCodeInformationResult>()
        .AddType<CheckSupplierCodeInformationResult>()
        .AddType<UploadType>()
        .AddType<ClientNotExistsError>();

// Register IOptions pattern for AppSettings section
services.Configure<ApplicationSettings>(configuration.GetSection("AppSettings"));

// Register IOptions pattern for EmailServerSettings section
services.Configure<EmailServerSettings>(configuration.GetSection("EmailServerSettings"));

// Register IOptions pattern for AppHostInfo section
services.Configure<AppHostInfo>(configuration.GetSection("AppHostInfo"));

// Register IOptions pattern for DbUserAccountDefaultsSettings section
services.Configure<DbUserAccountDefaultsSettings>(configuration.GetSection("DbUserAccountDefaultsSettings"));

configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: false, reloadOnChange: true);

// Register Automapper
services.AddAutoMapper(typeof(Program).Assembly);
#endregion

#region "Database connection to Beelina System Database"
services.AddDbContext<BeelinaDataContext>(x => x.UseSqlServer(configuration.GetConnectionString("BeelinaDBConnection")));

var ActivateEFMigration = Convert.ToBoolean(configuration.GetSection("AppSettings:GeneralSettings:ActivateEFMigration").Value);

if (ActivateEFMigration)
{
    services.AddDbContext<BeelinaClientDataContext>(
        x => x.UseSqlServer(configuration.GetConnectionString("BeelinaClientDeveloperDBConnection"))
    );
}
else
{
    // This section performs dynamic setting up of connection string for each http request.
    // Getting the database name based on the App-Secret-Token header which is the encrypted version
    // of the database name.
    services.AddTransient<IHttpContextAccessor, HttpContextAccessor>();
    services.AddDbContext<BeelinaClientDataContext>((serviceProvider, options) =>
    {
        var httpContext = serviceProvider?.GetService<IHttpContextAccessor>()?.HttpContext;
        var systemDataContext = serviceProvider?.GetService<BeelinaDataContext>();

        // Get the encrypted App-Secret-Token header
        var appSecretToken = httpContext?.Request.Headers["App-Secret-Token"].ToString();

        // If app secret token is not provided, it is always 
        // assume that the request is going to ReserbizDataContext
        if (appSecretToken != "")
        {
            // Get the client information based on the app secret token
            var clientInfo = systemDataContext?.Clients.FirstOrDefault(c => c.DBHashName == appSecretToken);

            if (clientInfo == null)
                throw new Exception("Invalid App secret token. Please make sure that the app secret token you have provided is valid.");

            var forIntegrationTest = httpContext?.Request.Headers["For-Integration-Test"].ToString();

            // Format and configure connection string for the current http request.
            var clientConnectionString = String.Format(configuration.GetConnectionString("BeelinaClientDBTemplateConnection"), clientInfo?.DBServer, clientInfo?.DBName, clientInfo?.DBusername, clientInfo?.DBPassword);

            if (!String.IsNullOrEmpty(forIntegrationTest))
            {
                clientConnectionString = configuration.GetConnectionString("BeelinaClientIntegrationTestDBTemplateConnection");
            }

            options.UseSqlServer(clientConnectionString);
        }
    });
}
#endregion

#region "JWT Authentication Setup"
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(configuration.GetSection("AppSettings:GeneralSettings:Token").Value))
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers.Add("Token-Expired", "true");
                }
                return Task.CompletedTask;
            }
        };
    });
#endregion

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(x => x
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGraphQL("/graphql");

app.MapGet("/", async ([Service] IClientRepository<Client> clientRepository) => await clientRepository.GetCompanyInfoByName("BeelinaDeveloper"));

app.Run();
