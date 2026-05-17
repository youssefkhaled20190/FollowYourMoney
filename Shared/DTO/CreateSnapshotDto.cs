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
    }
}
