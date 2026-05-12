namespace DAL.Interfaces
{
    public interface IFilter<T>
    {
        IQueryable<T> GetWhereStatement(IQueryable<T> query);
    }
}
