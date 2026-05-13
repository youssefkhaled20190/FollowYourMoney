using DAL.Interfaces;
using DAL.Model;
using Microsoft.EntityFrameworkCore;
using SharedLib.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class GameyaRepository : GenericRepository<Gameya>, IGameyaRepository
    {

        public GameyaRepository(Context.ApplicationDbContext context):base(context)
        {
            
        }
        public async Task<PagedResults<Gameya>> GetActiveByUserAsync(
             string userId,
             int pageNumber = 1,
             int pageSize = 10)
        {
            try
            {
                IQueryable<Gameya> query = _entities
                    .Where(s => s.UserId == userId && s.IsActive)
                    .AsNoTracking();

                var totalCount = await query.CountAsync();

                var pageItems = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PagedResults<Gameya>()
                {
                    Items = pageItems,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    TotalCount = totalCount
                };
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Error fetching Gameya: {ex.Message}", ex);
            }
        }
        public async Task<Gameya?> GetWithPaymentsAsync(int gameyaId, string userId)
        {
            return await _entities
                .Where(g => g.GameyaId == gameyaId && g.UserId == userId)
                .Include(g => g.Payments.OrderBy(p => p.MonthNumber))
                .FirstOrDefaultAsync();
        }
    }
}
