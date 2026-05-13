using DAL.Model;
using DAL.Repositories;
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
        Task<PagedResults<Gameya>> GetActiveByUserAsync(string userId , int pageNumber , int pageSize);

        //Get The History of Specific Gameya for the user
        Task<Gameya?> GetWithPaymentsAsync(int gameyaId, string userId);
    }
}
