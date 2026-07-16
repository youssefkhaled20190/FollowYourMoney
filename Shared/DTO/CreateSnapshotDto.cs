namespace Shared.DTO
{
    /// <summary>
    /// Request body for creating a new monthly plan.
    /// The service auto-computes TotalCommitments from active gameyas + installments.
    /// </summary>
    public class CreateSnapshotDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal Salary { get; set; }
        public decimal Bonuses { get; set; }
        public decimal CarryOver { get; set; }

        /// <summary>
        /// How much of FreeCash to allocate toward wishlist goals each month.
        /// If 0 the system uses all FreeCash for weekly spending.
        /// </summary>
        public decimal AllocatedToWishlist { get; set; }

        /// <summary>
        /// How much the user wants to save this month as carryover for next month.
        /// Deducted from spendable cash alongside AllocatedToWishlist.
        /// </summary>
        public decimal CarryOverGoal { get; set; }

        public decimal? CustomWeeklyBudget { get; set; }
        public decimal? WishlistPercentage { get; set; }
    }
}
