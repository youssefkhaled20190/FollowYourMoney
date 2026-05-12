using DAL.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Filter
{
    public class MonthlySnapshotFilter
    {
        public int? Year { get; set; }
        public int? Month { get; set; }

        public IQueryable<MonthlySnapshot> GetWhereStatment(IQueryable<MonthlySnapshot> query)
        {
            if (Year.HasValue)
            {
                query = query.Where(s => s.Year == Year.Value);
            }
            if (Month.HasValue)
            {
                query = query.Where(s => s.Month == Month.Value);
            }
            return query;
        }

    }
}
