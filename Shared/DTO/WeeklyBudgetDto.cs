using System;

namespace Shared.DTO
{
    public class WeeklyBudgetDto
    {
        public int WeekBudgetId { get; set; }
        public int SnapshotId { get; set; }

        public int WeekNumber { get; set; }       // 1, 2, 3, 4
        public decimal BudgetAmount { get; set; }
        public DateOnly WeekStart { get; set; }
        public DateOnly WeekEnd { get; set; }

        // Computed by service — not stored in DB
        public decimal SpentAmount { get; set; }
        public decimal RemainingBudget => BudgetAmount - SpentAmount;
        public string? Note { get; set; }

        // How many days are left in this week (0 if past)
        public int DaysRemaining
        {
            get
            {
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                if (today > WeekEnd) return 0;
                if (today < WeekStart) return WeekEnd.DayNumber - WeekStart.DayNumber + 1;
                return WeekEnd.DayNumber - today.DayNumber + 1;
            }
        }
    }
}
