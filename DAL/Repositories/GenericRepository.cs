using DAL.Interfaces;
using DAL.Context;
using Microsoft.EntityFrameworkCore;
using DAL.Model;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore.Storage;

namespace DAL.Repositories
{
    public class GenericRepository<Entity> : IGeneric<Entity> where Entity : class
    {
        protected readonly Context.ApplicationDbContext _context;
        protected readonly DbSet<Entity> _entities;
        public GenericRepository(Context.ApplicationDbContext context)
        {
            _context = context;
            // Initialize the DbSet for the specific entity type
            _entities = _context.Set<Entity>();
        }

        public virtual async Task<Entity> AddAsync(Entity entity)
        {
            try
            {
                // Add then Save in Db
                // using _entities for generic DbSet
                await _entities.AddAsync(entity);
                await _context.SaveChangesAsync();
                return entity;
            }
            catch (DbUpdateException dbEx)
            {
                throw new Exception($"Database update failed while adding {typeof(Entity).Name}. " +
                    $"Possible constraint or FK issue: {dbEx.InnerException?.Message ?? dbEx.Message}", dbEx);
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Error while adding entity {ex.Message}", ex);
            }
        }

        public virtual async Task<bool> DeleteAsync(int id)
        {
            try
            {
                // Remove then Save in Db
                var record = await GetByIdAsync(id);
                if (record == null)
                {
                    throw new Exception("Entity not found");
                }
                _entities.Remove(record);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException dbEx)
            {
                throw new Exception($"Database update failed while deleting {typeof(Entity).Name} (ID {id}). " +
                    $"May be due to foreign key constraint: {dbEx.InnerException?.Message ?? dbEx.Message}", dbEx);
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Error while deleting entity {ex.Message}", ex);
            }
        }

        public virtual async Task<List<Entity>> GetAllAsync()
        {
            try
            {
                // Get All Records in Db for this entity
                return await _entities.ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Error while getting all entities{ex.Message}", ex);
            }
        }

        public virtual async Task<Entity?> GetByIdAsync(int id)
        {
            try
            {
                // Find the Record which its Id = id
                return await _entities.FindAsync(id);
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Error while getting entity {ex.Message}", ex);
            }
        }

        public virtual async Task<int> GetCountAsync()
        {
            try
            {
                // Count the Records for this entity
                return await _entities.CountAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Error while counting entities{ex.Message}", ex);
            }
        }

        public virtual async Task<List<Entity>> GetPagedAsync(int pageNumber, int pageSize)
        {
            try
            {
                return await _entities
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Error while getting pagination: {ex.Message}", ex);
            }
        }

        public virtual async Task<bool> UpdateAsync(Entity entity)
        {
            try
            {
                _entities.Update(entity);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException cex)
            {
                throw new Exception($"Concurrency conflict while updating {typeof(Entity).Name}. " +
                    "The record may have been modified or deleted by another process.", cex);
            }
            catch (DbUpdateException dbEx)
            {
                throw new Exception($"Database update failed while updating {typeof(Entity).Name}. " +
                    $"Possible constraint or data issue: {dbEx.InnerException?.Message ?? dbEx.Message}", dbEx);
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Error while updating entity: {ex.Message}", ex);
            }
        }
        public virtual async Task<bool> IsExistAsync(Expression<Func<Entity, bool>> predicate)
        {
            try
            {
                return await _entities.AnyAsync(predicate);
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Error while checking existence by name: {ex.Message}", ex);
            }
        }


        public virtual async Task<List<Entity>> AddRangeAsync(List<Entity> entities)
        {
            await _entities.AddRangeAsync(entities);
            await _context.SaveChangesAsync();
            return entities;
        }
        public virtual async Task<bool> ChangeStatusAsync(int id, string? userId, string probrtyName)
        {
            var entity = await _entities.FindAsync(id);
            if (entity == null)
                throw new Exception(
                    $"{typeof(Entity).Name} not found");

            var statusProp = typeof(Entity).GetProperty(probrtyName);

            if (statusProp == null)
                throw new Exception(
                    $"{typeof(Entity).Name} does not have a {probrtyName} property");

            // Get current value and toggle it
            var currentValue = (bool?)statusProp.GetValue(entity) ?? false;
            statusProp.SetValue(entity, !currentValue);

            _entities.Update(entity);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<IDbContextTransaction> GenerateTransaction()
        {
            if (_context.Database.CurrentTransaction != null)
            {
                return _context.Database.CurrentTransaction;
            }

            return await _context.Database.BeginTransactionAsync();
        }
        public virtual async Task<bool> UpdateRangeAsync(List<Entity> entities)
        {
            _entities.UpdateRange(entities);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public virtual async Task<List<Entity>> GetDataAssociative<EntityFilter>(EntityFilter Filter) where EntityFilter : IFilter<Entity>
        {
            var query = Filter!.GetWhereStatement(_context.Set<Entity>().AsQueryable());
            var Rslt = await query.ToListAsync();
            return Rslt;
        }
        public virtual async Task<(List<Entity> Data, int TotalRows)> GetDataPageAssociative<EntityFilter>(EntityFilter Filter, int pageNumber = 1, int pageSize = 30, List<int>? loadOption = null) where EntityFilter : IFilter<Entity>
        {
            var query = Filter!.GetWhereStatement(_context.Set<Entity>().AsQueryable());
            var TotalRows = await query.CountAsync();
            var pagedData = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return (pagedData, TotalRows);
        }
    }
}
