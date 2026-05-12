using DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Model
{

    public class SnapshotTrigger
    {
        public int TriggerId { get; set; }
        public int SnapshotId { get; set; }

        public TriggerType TriggerType { get; set; }
        public decimal? CashInHand { get; set; }  // للـ ArbitraryAction بس
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public MonthlySnapshot Snapshot { get; set; } = null!;

    }
}
