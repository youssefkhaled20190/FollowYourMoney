namespace Shared.DTO
{
    public class EditSnapshotDto
    {
        public int SnapshotId { get; set; }
        public decimal Salary { get; set; }
        public decimal Bonuses { get; set; }
        public decimal CarryOver { get; set; }
        public decimal CarryOverGoal { get; set; }
        public decimal AllocatedToWishlist { get; set; }
        public decimal? CustomWeeklyBudget { get; set; }
        public decimal? WishlistPercentage { get; set; }
    }
}
