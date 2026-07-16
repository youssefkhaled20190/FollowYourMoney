namespace Shared.DTO
{
    public class MonthlySnapshotDto
    {
        public int SnapshotId { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }

        // Income
        public decimal Salary { get; set; }
        public decimal Bonuses { get; set; }
        public decimal CarryOver { get; set; }
        public decimal TotalIncome => Salary + Bonuses + CarryOver;

        // Savings goal for next month
        public decimal CarryOverGoal { get; set; }

        // After commitments
        public decimal TotalCommitments { get; set; }
        public decimal FreeCash { get; set; }
        public decimal TotalCashThisMonth { get; set; }
        public decimal AllocatedToWishlist { get; set; }
        public decimal WeeklyBudget { get; set; }

        public decimal? WishlistPercentage { get; set; }
        public decimal? CustomWeeklyBudget { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation — populated on detail/latest endpoints
        public List<WeeklyBudgetDto> WeeklyBudgets { get; set; } = [];
        public List<WishlistSummaryDto> WishlistSummary { get; set; } = [];
        public List<GameyaDetailDto> Gameyas { get; set; } = [];
        public List<InstallmentDto> Installments { get; set; } = [];
    }
}
