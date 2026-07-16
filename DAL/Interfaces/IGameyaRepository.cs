using DAL.Filter;
using DAL.Model;
using DAL.Repositories;
using Shared.DTO;
using SharedLib.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IGameyaRepository : IGeneric<Gameya>
    {
        Task<PagedResults<Gameya>> GetActiveByUserAsync(string userId , RequestDto<WithOutFilter> body);
        Task<PagedResults<Gameya>> GetAllByUserAsync(string userId, RequestDto<WithOutFilter> body);
        //Get The History of Specific Gameya for the user
        Task<Gameya?> GetWithPaymentsAsync(int gameyaId, string userId);
    }
}
