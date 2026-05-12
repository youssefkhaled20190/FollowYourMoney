using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Model
{
    public class WeeklyBudget
    {
        public int WeekBudgetId { get; set; }
        public int SnapshotId { get; set; }

        public int WeekNumber { get; set; }     // 1, 2, 3, 4
        public decimal BudgetAmount { get; set; }
        public DateOnly WeekStart { get; set; }
        public DateOnly WeekEnd { get; set; }

        // Navigation
        public MonthlySnapshot Snapshot { get; set; } = null!;
        public ICollection<Expense> Expenses { get; set; } = [];
    }
}
