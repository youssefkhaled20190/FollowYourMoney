using DAL.Filter;
using DAL.Model;
using Shared.DTO;
using SharedLib.Helper;

namespace DAL.Interfaces
{
    public interface IMonthlySnapshotRepository : IGeneric<MonthlySnapshot>
    {
        /// <summary>Latest snapshot with WeeklyBudgets and Triggers loaded.</summary>
        Task<MonthlySnapshot?> GetLatestSnapshotAsync(string userId);

        /// <summary>Paged history of snapshots for the user.</summary>
        Task<PagedResults<MonthlySnapshot>> GetuserSnapshotsAsync(string userId, RequestDto<MonthlySnapshotFilter> body);

        /// <summary>Looks up a specific year/month snapshot — used to prevent duplicates.</summary>
        Task<MonthlySnapshot?> GetByYearMonthAsync(string userId, int year, int month);
    }
}

