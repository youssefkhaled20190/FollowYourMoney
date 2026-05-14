using DAL.Filter;
using DAL.Interfaces;
using DAL.Model;
using Microsoft.EntityFrameworkCore;
using Shared.DTO;
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
        public async Task<PagedResults<Gameya>> GetActiveByUserAsync(string userId, RequestDto<WithOutFilter> body)
        {
            try
            {
                IQueryable<Gameya> query = _entities
                    .Where(s => s.UserId == userId && s.IsActive)
                    .AsNoTracking();

                var totalCount = await query.CountAsync();

                var pageItems = await query
                    .Skip((body.PageNumber - 1) * body.PageSize)
                    .Take(body.PageSize)
                    .ToListAsync();

                return new PagedResults<Gameya>()
                {
                    Items = pageItems,
                    PageNumber = body.PageNumber,
                    PageSize = body.PageSize,
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
