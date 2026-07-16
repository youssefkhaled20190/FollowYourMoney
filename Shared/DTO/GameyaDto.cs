using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.DTO
{
    public class GameyaDto
    {
        public int GameyaId { get; set; }
        public string UserId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public decimal MonthlyContribution { get; set; }
        public int TotalMembers { get; set; }
        public int MyTurn { get; set; } 
        public string CreatedBy { get; set; } = null!;
        public DateOnly StartDate { get; set; }
    }
}
