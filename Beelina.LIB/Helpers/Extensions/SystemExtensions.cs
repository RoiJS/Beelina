using Beelina.LIB.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using System.Text.RegularExpressions;

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
        // public static DateTime ConvertToTimeZone(this DateTime dateTime, string timezoneId)
        // {
        //     var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId);
        //     // var utcDateTime = dateTime.Kind == DateTimeKind.Utc
        //     //     ? dateTime
        //     //     : dateTime.ToUniversalTime();
        //     return TimeZoneInfo.ConvertTimeFromUtc(dateTime, timeZone);
        // }

        public static DateTime ConvertToTimeZone(this DateTime dateTime, string timezoneId)
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId);

            var utcDateTime = dateTime.Kind switch
            {
                DateTimeKind.Utc => dateTime,
                DateTimeKind.Unspecified => DateTime.SpecifyKind(dateTime, DateTimeKind.Utc),
                DateTimeKind.Local => dateTime.ToUniversalTime(),
                _ => dateTime
            };

            return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, timeZone);
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

        public static bool IsMatchAnyKeywords(this string input, string keywords)
        {
            if (string.IsNullOrEmpty(input) || string.IsNullOrEmpty(keywords))
                return false;

            input = input.ToLower();
            string[] keywordArray = [.. keywords.Split(',').Select(k => k.Trim().ToLower())];

            return keywordArray.Any(keyword =>
            {
                string[] keywordWords = keyword.Split(' ');
                return keywordWords.All(word => input.Contains(word));
            });
        }

        public static int CalculatePrecision(this string input, string keywords)
        {
            // Convert input and keywords to lowercase
            input = input.ToLower();
            keywords = keywords.ToLower();

            if (input.Contains(keywords))
            {
                // Calculate precision based on the number of matched characters
                int commonCharacters = 0;
                int minLength = Math.Min(input.Length, keywords.Length);

                for (int i = 0; i < minLength; i++)
                {
                    if (input[i] == keywords[i])
                    {
                        commonCharacters++;
                    }
                }

                return commonCharacters;
            }

            return 0; // Return 0 if no keywords are found
        }

        public static string FormatCurrency(this double input)
        {
            return $"₱ {input.ToString("N2")}";
        }


        /// <summary>
        /// Converts a Stream object to a byte array.
        /// </summary>
        /// <param name="stream">The Stream object to convert.</param>
        /// <returns>A byte array representation of the Stream object.</returns>
        public static byte[] ToByteArray(this Stream stream)
        {
            if (stream == null)
            {
                throw new ArgumentNullException(nameof(stream));
            }

            using (var memoryStream = new MemoryStream())
            {
                stream.CopyTo(memoryStream);
                return memoryStream.ToArray();
            }
        }
    }
}
