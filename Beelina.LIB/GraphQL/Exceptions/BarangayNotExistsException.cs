namespace Beelina.LIB.GraphQL.Exceptions
{
    public class BarangayNotExistsException
        : Exception
    {
        public int BarangayId { get; }
        public BarangayNotExistsException(int barangayId)
        {
            BarangayId = barangayId;
        }
    }
}
