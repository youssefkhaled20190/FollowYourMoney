using DAL.Filter;
using DAL.Model;
using Shared.DTO;
using SharedLib.Helper;

namespace DAL.Interfaces
{
    public interface IMonthlySnapshotRepository : IGeneric<MonthlySnapshot>
    {
        /// <summary>
        /// Returns snapshots with optional year/month filter.
        /// If no filter is provided, returns the most recent snapshot.
        /// Includes WeeklyBudgets (with Expenses) and Triggers.
        /// </summary>
        Task<PagedResults<MonthlySnapshot>> GetLatestSnapshotAsync(string userId, RequestDto<MonthlySnapshotFilter> body);

        /// <summary>Paged history of snapshots for the user.</summary>
        Task<PagedResults<MonthlySnapshot>> GetuserSnapshotsAsync(string userId, RequestDto<MonthlySnapshotFilter> body);

        /// <summary>Looks up a specific year/month snapshot — used to prevent duplicates.</summary>
        Task<MonthlySnapshot?> GetByYearMonthAsync(string userId, int year, int month);
    }
}
