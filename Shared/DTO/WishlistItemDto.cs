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

        // Computed — not stored in DB
        public decimal Remaining => TargetAmount - SavedAmount;

        /// <summary>
        /// Estimated months to reach this goal.
        /// Populated by the service using the latest snapshot's FreeCash
        /// and the priority ordering of all pending items.
        /// </summary>
        public decimal EtaMonths { get; set; }

        /// <summary>Human-readable ETA label.</summary>
        public string EtaLabel
        {
            get
            {
                if (IsAchieved || EtaMonths <= 0) return "Achieved";
                var months = (int)Math.Ceiling(EtaMonths);
                var years = months / 12;
                var rem = months % 12;
                if (years == 0) return $"{rem} month{(rem != 1 ? "s" : "")}";
                if (rem == 0) return $"{years} year{(years != 1 ? "s" : "")}";
                return $"{years} year{(years != 1 ? "s" : "")} {rem} month{(rem != 1 ? "s" : "")}";
            }
        }
    }
}
