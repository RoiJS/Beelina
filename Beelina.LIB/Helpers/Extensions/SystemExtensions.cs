using Beelina.LIB.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;

namespace Beelina.LIB.Helpers.Extensions
{
    public static class SystemExtensions
    {
        /// <summary>
        /// This calculates the last day of the month.
        /// </summary>
        /// <param name="dateTime"></param>
        /// <returns></returns>
        public static DateTime GetLastDayOfMonth(this DateTime dateTime)
        {
            return new DateTime(dateTime.Year, dateTime.Month, DateTime.DaysInMonth(dateTime.Year, dateTime.Month));
        }

        public static IQueryable<TEntity> Includes<TEntity>(this IQueryable<TEntity> query,
                                    params Expression<Func<TEntity, object>>[] includes)
                                    where TEntity : class, IEntity
        {
            if (includes != null)
            {
                query = includes.Aggregate(query, (current, include) => current.Include(include));
            }

            return query;
        }

        public static Expression<Func<TEntity, object>>[] IncludeAlso<TEntity>(this IEnumerable<TEntity> entities,
                                params Expression<Func<TEntity, object>>[] includes)
                                where TEntity : class, IEntity
        {
            return includes;
        }


        /// <summary>
        /// This will be generic function use to retrieve user claim depending on claim type specified as parameter.
        /// </summary>
        /// <param name="identity"></param>
        /// <param name="claimType"></param>
        /// <returns></returns>
        public static object GetUserClaim(this IIdentity identity, string claimType)
        {
            ClaimsIdentity claimsIdentity = identity as ClaimsIdentity;
            Claim claim = claimsIdentity?.FindFirst(claimType);

            if (claim == null)
                return null;

            return claim.Value;
        }

        public static string ToCurrencyFormat(this float number)
        {
            NumberFormatInfo nfi = new CultureInfo("fil-PH", false).NumberFormat;
            nfi.CurrencySymbol = "Php ";
            var amountFormatted = string.Format(nfi, "{0:C}", number);
            return amountFormatted;
        }

        /// <summary>
        /// Convert date and time based on the timezone id
        /// </summary>
        /// <param name="dateTime"></param>
        /// <param name="timezoneId"></param>
        /// <returns></returns>
        public static DateTime ConvertToTimeZone(this DateTime dateTime, string timezoneId)
        {
            return TimeZoneInfo.ConvertTimeBySystemTimeZoneId(dateTime.ToUniversalTime(), timezoneId);
        }

        /// <summary>
        /// Convert date and time based on the local timezone id
        /// </summary>
        /// <param name="dateTime"></param>
        /// <param name="timezoneId"></param>
        /// <returns></returns>
        public static DateTime ToLocalTimeZone(this DateTime dateTime)
        {
            return TimeZoneInfo.ConvertTimeBySystemTimeZoneId(dateTime.ToUniversalTime(), TimeZoneInfo.Local.Id);
        }

        /// <summary>
        /// Adds spaces before capital letters in a pascal case string.
        /// </summary>
        /// <param name="input">The input string to be processed.</param>
        /// <returns>The processed string with spaces added.</returns>
        public static string AddSpacesToPascal(this string input)
        {
            StringBuilder result = new();

            foreach (char character in input)
            {
                if (char.IsUpper(character) && result.Length > 0)
                {
                    result.Append(' '); // Add space before capital letters (excluding the first one).
                }
                result.Append(character);
            }

            return result.ToString();
        }
    }
}
