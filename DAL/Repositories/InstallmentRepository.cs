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
    public class InstallmentRepository : GenericRepository<Installment>, IInstallmentRepository
    {

        public InstallmentRepository(Context.ApplicationDbContext context) : base(context)
        {

        }
        public async Task<PagedResults<Installment>> GetActiveByUserAsync(string userId, RequestDto<WithOutFilter> body)
        {
            try
            {
                IQueryable<Installment> query = _entities
                    .Where(s => s.UserId == userId && s.IsActive)
                    .AsNoTracking();

                var totalCount = await query.CountAsync();

                var pageItems = await query
                    .Skip((body.PageNumber - 1) * body.PageSize)
                    .Take(body.PageSize)
                    .ToListAsync();

                return new PagedResults<Installment>()
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
                    $"Error fetching Installment: {ex.Message}", ex);
            }
        }

        public async Task<PagedResults<Installment>> GetAllInstallmentsByUserAsync(string userId, RequestDto<WithOutFilter> body)
        {
            try
            {
                IQueryable<Installment> query = _entities
                    .Where(s => s.UserId == userId)
                    .AsNoTracking();

                var totalCount = await query.CountAsync();

                var pageItems = await query
                    .Skip((body.PageNumber - 1) * body.PageSize)
                    .Take(body.PageSize)
                    .ToListAsync();

                return new PagedResults<Installment>()
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
                    $"Error fetching Installment: {ex.Message}", ex);
            }
        }
    }
}
