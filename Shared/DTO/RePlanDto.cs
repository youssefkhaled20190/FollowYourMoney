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
    }
}
