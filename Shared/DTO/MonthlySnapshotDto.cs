using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.DTO
{
    public class MonthlySnapshotDto
    {
        public int SnapshotId { get; set; }
        public string UserId { get; set; } = null!; // ASP Identity user id
        public int Year { get; set; }
        public int Month { get; set; }
        // الدخل
        public decimal Salary { get; set; }
        public decimal Bonuses { get; set; }
        public decimal CarryOver { get; set; }
        public decimal TotalIncome => Salary + Bonuses + CarryOver;
        // بعد الحسابات
        public decimal TotalCommitments { get; set; }
        public decimal FreeCash { get; set; }
        public decimal AllocatedToWishlist { get; set; }
        public decimal WeeklyBudget { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
