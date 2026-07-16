namespace Shared.DTO
{
    public class WishlistItemDto
    {
        public int ItemId { get; set; }
        public string Name { get; set; } = null!;
        public decimal TargetAmount { get; set; }
        public decimal SavedAmount { get; set; }
        public int Priority { get; set; }   // 1 = most important
        public bool IsAchieved { get; set; }
        public bool IsCritical { get; set; }

        public DateOnly? DueDate { get; set; }
        public decimal SavePercentage { get; set; }

        // Computed by service — not stored in DB
        public decimal Remaining { get; set; }

        /// <summary>
        /// Estimated days to reach this goal.
        /// Populated by the service using the user's monthly savings allocation
        /// and the priority ordering of all pending items.
        /// -1 means no savings allocated.
        /// </summary>
        public int EtaDays { get; set; }

        /// <summary>
        /// Human-readable ETA label, e.g. "3 days", "2 weeks", "1 month 2 weeks".
        /// Populated by the service.
        /// </summary>
        public string EtaLabel { get; set; } = string.Empty;

        // Date-based goals properties
        public decimal RequiredMonthlySaving { get; set; }
        public decimal ActualMonthlySave { get; set; }
        public decimal RequiredPercentage { get; set; }
        public string StatusLabel { get; set; } = string.Empty;
    }
}
