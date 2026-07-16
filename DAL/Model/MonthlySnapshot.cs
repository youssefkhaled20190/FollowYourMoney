using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Model
{
    public class MonthlySnapshot
    {
        public int SnapshotId { get; set; }
        public string UserId { get; set; } = null!; // ASP Identity user id
        public int Year { get; set; }
        public int Month { get; set; }

        // الدخل
        public decimal Salary { get; set; }
        public decimal Bonuses { get; set; }
        public decimal CarryOver { get; set; }

        // هدف التوفير للشهر الجاي
        public decimal CarryOverGoal { get; set; }

        // بعد الحسابات
        public decimal TotalCommitments { get; set; }
        public decimal FreeCash { get; set; }
        public decimal TotalCashThisMonth { get; set; } // Gameya pot received this month (display only, not in FreeCash calc)
        public decimal AllocatedToWishlist { get; set; }
        public decimal WeeklyBudget { get; set; }

        public decimal? WishlistPercentage { get; set; }
        public decimal? CustomWeeklyBudget { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<WeeklyBudget> WeeklyBudgets { get; set; } = [];
        public ICollection<SnapshotTrigger> Triggers { get; set; } = [];
    }
}
