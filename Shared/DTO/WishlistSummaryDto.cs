namespace Shared.DTO
{
    /// <summary>
    /// Lightweight wishlist summary embedded inside a MonthlySnapshot response.
    /// All computed fields are populated by the service layer.
    /// </summary>
    public class WishlistSummaryDto
    {
        public int ItemId { get; set; }
        public string Name { get; set; } = null!;
        public int Priority { get; set; }
        public decimal TargetAmount { get; set; }
        public decimal SavedAmount { get; set; }
        public bool IsCritical { get; set; }

        public DateOnly? DueDate { get; set; }
        public decimal SavePercentage { get; set; }

        // Computed by service
        public decimal Remaining { get; set; }

        /// <summary>Estimated days to achieve based on allocated monthly savings. -1 = no savings allocated.</summary>
        public int EtaDays { get; set; }

        /// <summary>Human-readable ETA, e.g. "2 weeks", "1 month 3 weeks".</summary>
        public string EtaLabel { get; set; } = string.Empty;

        // Date-based goals properties
        public decimal RequiredMonthlySaving { get; set; }
        public decimal ActualMonthlySave { get; set; }
        public decimal RequiredPercentage { get; set; }
        public string StatusLabel { get; set; } = string.Empty;
    }
}
