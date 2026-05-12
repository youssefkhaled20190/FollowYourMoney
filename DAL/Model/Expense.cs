using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Model
{
    public class Expense
    {
        public int ExpenseId { get; set; }
        public int WeekBudgetId { get; set; }
        public string UserId { get; set; } = null!;

        public string Name { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Category { get; set; } = null!;
        public DateOnly ExpenseDate { get; set; }

        // Navigation
        public WeeklyBudget WeeklyBudget { get; set; } = null!;
    }
}
