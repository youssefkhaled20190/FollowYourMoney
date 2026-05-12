using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.DTO
{
    public class WithOutFilter { }
    public class RequestDto<ReuestedClass> where ReuestedClass : class
    {
        public ReuestedClass? Filter { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string OrderBy { get; set; } = string.Empty;
        public string Order { get; set; } = "asc";
    }
}
