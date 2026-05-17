using DAL.Filter;
using DAL.Interfaces;
using DAL.Model;
using Microsoft.EntityFrameworkCore;
using Shared.DTO;
using SharedLib.Helper;
using System.Linq.Dynamic.Core;

namespace DAL.Repositories
{
    public class MonthlySnapshotRepository : GenericRepository<MonthlySnapshot>, IMonthlySnapshotRepository
    {
        public MonthlySnapshotRepository(Context.ApplicationDbContext context) : base(context)
        {
        }

        /// <inheritdoc />
        public async Task<MonthlySnapshot?> GetLatestSnapshotAsync(string userId)
        {
            return await _entities
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .Include(s => s.WeeklyBudgets).ThenInclude(w => w.Expenses)
                .Include(s => s.Triggers)
                .FirstOrDefaultAsync();
        }

        /// <inheritdoc />
        public async Task<MonthlySnapshot?> GetByYearMonthAsync(string userId, int year, int month)
        {
            return await _entities
                .Where(s => s.UserId == userId && s.Year == year && s.Month == month)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        /// <inheritdoc />
        public async Task<PagedResults<MonthlySnapshot>> GetuserSnapshotsAsync(string userId, RequestDto<MonthlySnapshotFilter> body)
        {
            try
            {
                IQueryable<MonthlySnapshot> query = _entities
                    .Where(s => s.UserId == userId)
                    .OrderByDescending(s => s.CreatedAt)
                    .Include(s => s.WeeklyBudgets)
                    .Include(s => s.Triggers);

                query = body.Filter?.GetWhereStatment(query) ?? query;

                if (string.IsNullOrEmpty(body.OrderBy))
                    body.OrderBy = "CreatedAt";

                query = query.OrderBy($"{body.OrderBy} {body.Order}");

                var totalCount = await query.CountAsync();
                var pageItems = await query.AsNoTracking()
                    .Skip((body.PageNumber - 1) * body.PageSize)
                    .Take(body.PageSize)
                    .ToListAsync();

                return new PagedResults<MonthlySnapshot>
                {
                    Items = pageItems,
                    PageNumber = body.PageNumber,
                    PageSize = body.PageSize,
                    TotalCount = totalCount
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching MonthlySnapshot: {ex.Message}", ex);
            }
        }
    }
}
