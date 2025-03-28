using AutoMapper;
using Beelina.LIB.GraphQL.Types;
using Beelina.LIB.Interfaces;

namespace Beelina.LIB.Helpers.Extensions
{
    public static class AutoMapperExtensions
    {
        /// <summary>
        /// Maps the entities in the source list to their corresponding entities in the destination list. If an entity in the source list does not exist in the destination list, a new entity is created in the destination list. If an entity in the source list has the same ID as an entity in the destination list, the entity in the destination list is updated with the values from the source list.
        /// </summary>
        /// <typeparam name="TSource">The type of the source entities.</typeparam>
        /// <typeparam name="TDestination">The type of the destination entities.</typeparam>
        /// <param name="mapper">The AutoMapper mapper.</param>
        /// <param name="sourceList">The list of source entities.</param>
        /// <param name="destinationList">The list of destination entities.</param>
        /// <returns>The list of destination entities.</returns>
        public static List<TDestination> MapEntities<TSource, TDestination>(
            this IMapper mapper,
            List<TSource> sourceList,
            List<TDestination> destinationList)
            where TSource : IEntityInput
            where TDestination : IEntity
        {
            var newEntities = new List<TDestination>();

            foreach (var source in sourceList)
            {
                var existingEntity = destinationList.FirstOrDefault(dest =>
                    source.Id.Equals(dest.Id));

                if (existingEntity != null)
                {
                    existingEntity = mapper.Map(source, existingEntity);
                    newEntities.Add(existingEntity);
                }
                else
                {
                    var newEntity = mapper.Map<TDestination>(source);
                    newEntities.Add(newEntity);
                }
            }

            var finalEntities = newEntities.Where(x => sourceList.Exists(y => y.Id == x.Id) || x.Id == 0).ToList();

            return finalEntities;
        }
    }
}