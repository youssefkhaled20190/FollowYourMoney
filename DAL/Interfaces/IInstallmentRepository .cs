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
    public interface IInstallmentRepository : IGeneric<Installment>
    {
        Task<PagedResults<Installment>> GetActiveByUserAsync(string userId, RequestDto<WithOutFilter> body);

        Task<PagedResults<Installment>> GetAllInstallmentsByUserAsync(string userId, RequestDto<WithOutFilter> body);
    }
}
