using DAL.Model;
using DAL.Repositories;
using Microsoft.EntityFrameworkCore.Storage;
using System.Linq.Expressions;

namespace DAL.Interfaces
{
    public interface IGeneric<T> where T : class
    {
        public Task<List<T>> GetAllAsync(); // for fetching all entities' data
        public Task<T?> GetByIdAsync(int id); // for fetching entity's data
        public Task<T> AddAsync(T entity); // for adding new entity
        public Task<bool> UpdateAsync(T entity); // for updating existing entity
        public Task<bool> DeleteAsync(int id); // for deleting existing entity
        public Task<List<T>> GetPagedAsync(int pageNumber, int pageSize); // for pagination
        public Task<int> GetCountAsync(); // for counting the number of records
        public Task<bool> IsExistAsync(Expression<Func<T, bool>> predicate);
        public Task<List<T>> AddRangeAsync(List<T> entities);
        public Task<bool> ChangeStatusAsync(int id, string? userId, string probrtyName);
        public Task<IDbContextTransaction> GenerateTransaction();
        public Task<bool> UpdateRangeAsync(List<T> entities);

        public Task<List<T>> GetDataAssociative<TFilter>(TFilter Filter) where TFilter : IFilter<T>;
        public Task<(List<T> Data, int TotalRows)> GetDataPageAssociative<TFilter>(TFilter Filter, int pageNumber = 1, int pageSize = 30, List<int>? loadOption = null) where TFilter : IFilter<T>;
    }
}
