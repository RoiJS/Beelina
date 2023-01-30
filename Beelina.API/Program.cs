using Beelina.API.Types.Mutations;
using Beelina.API.Types.Query;
using Beelina.LIB.BusinessLogic;
using Beelina.LIB.DbContexts;
using Beelina.LIB.GraphQL.Errors;
using Beelina.LIB.GraphQL.Results;
using Beelina.LIB.Helpers.Classes;
using Beelina.LIB.Helpers.Services;
using Beelina.LIB.Interfaces;
using Beelina.LIB.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Security.Principal;
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
services.AddScoped(typeof(ICurrentUserService), typeof(CurrentUserService));
services.AddScoped(typeof(IProductUnitRepository<ProductUnit>), typeof(ProductUnitRepository));
services.AddScoped(typeof(IProductRepository<Product>), typeof(ProductRepository));
services.AddScoped(typeof(IPaymentMethodRepository<PaymentMethod>), typeof(PaymentMethodRepository));
services.AddScoped(typeof(IStoreRepository<Store>), typeof(StoreRepository));
services.AddScoped(typeof(ITransactionRepository<Transaction>), typeof(TransactionRepository));
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
        .AddType<StoreQuery>()
        .AddType<TransactionQuery>()
        .AddType<UserAccountMutation>()
        .AddType<ProductMutation>()
        .AddType<StoreMutation>()
        .AddType<TransactionMutation>()
        .AddType<ClientMutation>()
        .AddType<ClientInformationResult>()
        .AddType<ClientNotExistsError>();

// Register IOptions pattern for AppSettings section
services.Configure<ApplicationSettings>(configuration.GetSection("AppSettings"));
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

app.Run();
