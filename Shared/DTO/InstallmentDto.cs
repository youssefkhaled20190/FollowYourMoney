using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.DTO
{
    public class InstallmentDto
    {

        public int InstallmentId { get; set; }
        public string Name { get; set; } = null!;
        public decimal MonthlyAmount { get; set; }
        public int TotalMonths { get; set; }
        public int PaidMonths { get; set; }
        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }
        public bool IsActive { get; set; } = true;

        // بيتحسب — مش بيتحفظ في الـ DB
        public int RemainingMonths => TotalMonths - PaidMonths;
        public bool IsCompleted => PaidMonths >= TotalMonths;
    }
}
