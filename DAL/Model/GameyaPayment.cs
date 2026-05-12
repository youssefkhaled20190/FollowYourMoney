using DAL.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Model
{
    public class GameyaPayment
    {
        public int PaymentId { get; set; }
        public int GameyaId { get; set; }

        public int MonthNumber { get; set; }
        public PaymentType Type { get; set; }
        public DateOnly PaidOn { get; set; }

        // Navigation
        public Gameya Gameya { get; set; } = null!;
    }
}
