namespace Shared.DTO
{
    /// <summary>
    /// Lightweight wishlist summary embedded inside a MonthlySnapshot response.
    /// </summary>
    public class WishlistSummaryDto
    {
        public int ItemId { get; set; }
        public string Name { get; set; } = null!;
        public int Priority { get; set; }
        public decimal TargetAmount { get; set; }
        public decimal SavedAmount { get; set; }
        public decimal Remaining => TargetAmount - SavedAmount;

        /// <summary>Estimated months to achieve based on allocated monthly savings.</summary>
        public decimal EtaMonths { get; set; }

        /// <summary>Human-readable ETA, e.g. "2 months", "1 year 3 months".</summary>
        public string EtaLabel
        {
            get
            {
                if (EtaMonths <= 0) return "Achieved";
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
