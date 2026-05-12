using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Model
{
    public class Gameya
    {
        public int GameyaId { get; set; }
        public string UserId { get; set; } = null!;

        public string Name { get; set; } = null!;
        public decimal MonthlyContribution { get; set; }
        public int TotalMembers { get; set; }
        public int MyTurn { get; set; }       // optional — nullable لو مش عارف
        public DateOnly StartDate { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation
        public ICollection<GameyaPayment> Payments { get; set; } = [];
    }
}
