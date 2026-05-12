using System.Collections.Concurrent;
using System.Linq.Expressions;
using System.Reflection;

namespace BLL.Mapping
{
    public static class ManualMapper
    {
        private static readonly ConcurrentDictionary<string, Delegate> _mapCache = new();

        public static TDest? CreateMapped<TSource, TDest>(TSource source, int level = 1) where TDest : new()
        {
            if (source == null) return default;
            return MapBase<TSource, TDest>(source, level);
        }

        public static List<TDest> MapList<TSource, TDest>(IEnumerable<TSource> sourceList, int level = 1) where TDest : new()
        {
            if (sourceList == null) return new List<TDest>();

            List<TDest> destList = new List<TDest>();
            foreach (var item in sourceList)
            {
                var destItem = MapBase<TSource, TDest>(item, level);
                if (destItem != null)
                    destList.Add(destItem);
            }
            return destList;
        }

        public static TDest? MapBase<TSource, TDest>(TSource source, int level = 1) where TDest : new()
        {
            var dest = new TDest();
            if (source == null || dest == null) return default;

            string key = $"{typeof(TSource).FullName}_{typeof(TDest).FullName}_{level}";

            var mapper = (Action<TSource, TDest>)_mapCache.GetOrAdd(key, _ => CompileMapper<TSource, TDest>(level));
            mapper(source, dest);

            return dest;
        }

        private static Action<TSource, TDest> CompileMapper<TSource, TDest>(int level)
        {
            var sourceParam = Expression.Parameter(typeof(TSource), "source");
            var destParam = Expression.Parameter(typeof(TDest), "dest");
            var expressions = new List<Expression>();

            var sourceProps = typeof(TSource).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            var destProps = typeof(TDest).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var dp in destProps)
            {
                if (!dp.CanWrite) continue;

                var mapAttr = dp.GetCustomAttribute<MapToAttribute>();
                string sourceName = mapAttr != null ? mapAttr.TargetName : dp.Name;

                var sp = sourceProps.FirstOrDefault(s => s.Name == sourceName);
                if (sp == null || !sp.CanRead) continue;

                var sourceGetter = Expression.Property(sourceParam, sp);
                var destSetter = Expression.Property(destParam, dp);

                Expression? assignmentBody = null;

                // Exact Match
                if (dp.PropertyType == sp.PropertyType)
                {
                    assignmentBody = Expression.Assign(destSetter, sourceGetter);
                }
                // Enum (Source) -> String (Destination)
                else if (dp.PropertyType == typeof(string) && sp.PropertyType.IsEnum)
                {
                    var toStringMethod = typeof(object).GetMethod("ToString", Type.EmptyTypes)!;
                    var toStringCall = Expression.Call(Expression.Convert(sourceGetter, typeof(object)), toStringMethod);
                    assignmentBody = Expression.Assign(destSetter, toStringCall);
                }
                // String (Source) -> Enum (Destination)
                else if (dp.PropertyType.IsEnum && sp.PropertyType == typeof(string))
                {
                    var tryParseMethod = typeof(Enum).GetMethods()
                        .First(m => m.Name == "TryParse" && m.GetParameters().Length == 3 && m.IsGenericMethod)
                        .MakeGenericMethod(dp.PropertyType);

                    var enumVar = Expression.Variable(dp.PropertyType, "enumVal");
                    var tryParseCall = Expression.Call(null, tryParseMethod, sourceGetter, Expression.Constant(true), enumVar);

                    assignmentBody = Expression.Block(
                        new[] { enumVar },
                        Expression.IfThen(tryParseCall, Expression.Assign(destSetter, enumVar))
                    );
                }
                // Collections
                else if (dp.PropertyType != typeof(string) && typeof(System.Collections.IEnumerable).IsAssignableFrom(dp.PropertyType) && 
                         sp.PropertyType != typeof(string) && typeof(System.Collections.IEnumerable).IsAssignableFrom(sp.PropertyType) && 
                         level > 0)
                {
                    Type? destArg = dp.PropertyType.IsGenericType ? dp.PropertyType.GetGenericArguments()[0] : dp.PropertyType.GetElementType();
                    Type? sourceArg = sp.PropertyType.IsGenericType ? sp.PropertyType.GetGenericArguments()[0] : sp.PropertyType.GetElementType();

                    if (destArg != null && sourceArg != null && checkDtoToModel(destArg.Name, sourceArg.Name))
                    {
                        var mapMethod = typeof(ManualMapper).GetMethod(nameof(MapList))!.MakeGenericMethod(sourceArg, destArg);
                        var mapListCall = Expression.Call(mapMethod, sourceGetter, Expression.Constant(level - 1));

                        if (dp.PropertyType.IsArray)
                        {
                            var toArrayMethod = typeof(Enumerable).GetMethod("ToArray")!.MakeGenericMethod(destArg);
                            var arrayCall = Expression.Call(toArrayMethod, mapListCall);
                            assignmentBody = Expression.Assign(destSetter, arrayCall);
                        }
                        else
                        {
                            assignmentBody = Expression.Assign(destSetter, mapListCall);
                        }
                    }
                }
                // Recursive object mapping
                else if (checkDtoToModel(dp.PropertyType.Name, sp.PropertyType.Name) && level > 0)
                {
                    var instantiateDest = Expression.Assign(
                        destSetter,
                        Expression.Coalesce(destSetter, Expression.New(dp.PropertyType))
                    );
                    
                    var mapBaseMethod = typeof(ManualMapper).GetMethod(nameof(MapBase))!.MakeGenericMethod(sp.PropertyType, dp.PropertyType);
                    var callMapBase = Expression.Call(mapBaseMethod, sourceGetter, destSetter, Expression.Constant(level - 1));

                    assignmentBody = Expression.Block(instantiateDest, callMapBase);
                }
                // Convert.ChangeType
                else
                {
                    var changeTypeCall = Expression.Call(
                        typeof(Convert).GetMethod("ChangeType", new[] { typeof(object), typeof(Type) })!,
                        Expression.Convert(sourceGetter, typeof(object)),
                        Expression.Constant(dp.PropertyType)
                    );
                    
                    var assign = Expression.Assign(destSetter, Expression.Convert(changeTypeCall, dp.PropertyType));
                    assignmentBody = Expression.TryCatch(
                        Expression.Block(typeof(void), assign),
                        Expression.Catch(typeof(Exception), Expression.Empty())
                    );
                }

                if (assignmentBody != null)
                {
                    bool isNullable = !sp.PropertyType.IsValueType || Nullable.GetUnderlyingType(sp.PropertyType) != null;
                    if (isNullable)
                    {
                        var nullCheck = Expression.NotEqual(sourceGetter, Expression.Constant(null, sp.PropertyType));
                        expressions.Add(Expression.IfThen(nullCheck, assignmentBody));
                    }
                    else
                    {
                        expressions.Add(assignmentBody);
                    }
                }
            }

            if (expressions.Count == 0)
            {
                return (s, d) => { };
            }

            var body = Expression.Block(expressions);
            return Expression.Lambda<Action<TSource, TDest>>(body, sourceParam, destParam).Compile();
        }

        private static bool checkDtoToModel(string destType, string srcType)
        {
            destType = destType.ToLower().Replace("dto", "");
            srcType = srcType.ToLower().Replace("dto", "");
            return destType == srcType;
        }
    }
}