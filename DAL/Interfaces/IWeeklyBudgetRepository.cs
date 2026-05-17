using DAL.Model;
using Shared.DTO;
using SharedLib.Helper;

namespace DAL.Interfaces
{
    public interface IWeeklyBudgetRepository : IGeneric<WeeklyBudget>
    {
        /// <summary>Returns all 4 weekly budgets for a given snapshot, including their expenses.</summary>
        Task<List<WeeklyBudget>> GetBySnapshotAsync(int snapshotId, string userId);

        /// <summary>
        /// Returns the budget row whose WeekStart ≤ today ≤ WeekEnd for the user's latest snapshot.
        /// Returns null when no current week is found (e.g., end of month gap).
        /// </summary>
        Task<WeeklyBudget?> GetCurrentWeekAsync(string userId);
    }
}
