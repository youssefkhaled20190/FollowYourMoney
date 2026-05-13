using DAL.Filter;
using DAL.Model;
using Shared.DTO;
using SharedLib.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IMonthlySnapshotRepository : IGeneric<MonthlySnapshot> 
    {
        Task<MonthlySnapshot> GetLatestSnapshotAsync(string userId);
        Task<PagedResults<MonthlySnapshot>> GetuserSnapshotsAsync(string userId ,RequestDto<MonthlySnapshotFilter>body);
    }
}
