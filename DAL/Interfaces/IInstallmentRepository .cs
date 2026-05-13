using DAL.Model;
using SharedLib.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IInstallmentRepository : IGeneric<Installment>
    {

        Task<PagedResults<Installment>> GetActiveByUserAsync(string userId, int pageNumber, int pageSize);
        Task<PagedResults<Installment>> GetCompletedByUserAsync(string userId, int pageNumber, int pageSize);
    }
}
