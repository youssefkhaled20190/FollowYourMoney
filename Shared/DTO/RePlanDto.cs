namespace Shared.DTO
{
    /// <summary>
    /// Mid-month replan — user declares how much cash they actually have right now.
    /// The system redistributes the cash evenly across the remaining weeks of the month.
    /// </summary>
    public class RePlanDto
    {
        public decimal CashInHand { get; set; }
        public string? Note { get; set; }

        /// <summary>
        /// Optional — allows the user to adjust their savings target during replan.
        /// If null, the existing CarryOverGoal is preserved.
        /// </summary>
        public decimal? CarryOverGoal { get; set; }
    }
}
