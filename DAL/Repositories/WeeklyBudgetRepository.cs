using DAL.Context;
using DAL.Interfaces;
using DAL.Model;
using Microsoft.EntityFrameworkCore;
using Shared.DTO;
using SharedLib.Helper;

namespace DAL.Repositories
{
    public class WeeklyBudgetRepository : GenericRepository<WeeklyBudget>, IWeeklyBudgetRepository
    {
        public WeeklyBudgetRepository(ApplicationDbContext context) : base(context)
        {
        }

        /// <inheritdoc />
        public async Task<List<WeeklyBudget>> GetBySnapshotAsync(int snapshotId, string userId)
        {
            // Verify ownership via the parent snapshot
            return await _entities
                .Where(w => w.SnapshotId == snapshotId && w.Snapshot.UserId == userId)
                .Include(w => w.Expenses)
                .OrderBy(w => w.WeekNumber)
                .AsNoTracking()
                .ToListAsync();
        }

        /// <inheritdoc />
        public async Task<WeeklyBudget?> GetCurrentWeekAsync(string userId)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            return await _entities
                .Where(w =>
                    w.Snapshot.UserId == userId &&
                    w.WeekStart <= today &&
                    w.WeekEnd >= today)
                .Include(w => w.Expenses)
                .OrderByDescending(w => w.Snapshot.CreatedAt)   // prefer newest snapshot
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }
    }
}
