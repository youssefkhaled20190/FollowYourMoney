using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.DTO
{
    public class GameyaPaymentDto
    {
        public int PaymentId { get; set; }
        public int GameyaId { get; set; }
        public int MonthNumber { get; set; }
        public string Type { get; set; } = null!; // "Paid" or "Received"
        public DateOnly PaidOn { get; set; }
    }
}
