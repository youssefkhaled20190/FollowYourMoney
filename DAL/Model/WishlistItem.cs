using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Model
{
    public class WishlistItem
    {
        public int ItemId { get; set; }
        public string UserId { get; set; } = null!;

        public string Name { get; set; } = null!;
        public decimal TargetAmount { get; set; }
        public decimal SavedAmount { get; set; }
        public int Priority { get; set; }       // 1 = أهم حاجة
        public bool IsAchieved { get; set; } = false;
        public bool IsCritical { get; set; } = false;

        public DateOnly? DueDate { get; set; }
        public decimal SavePercentage { get; set; }
    }
}
