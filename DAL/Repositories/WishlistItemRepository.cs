using DAL.Context;
using DAL.Interfaces;
using DAL.Model;
using Microsoft.EntityFrameworkCore;
using Shared.DTO;
using SharedLib.Helper;

namespace DAL.Repositories
{
    public class WishlistItemRepository : GenericRepository<WishlistItem>, IWishlistItemRepository
    {
        public WishlistItemRepository(ApplicationDbContext context) : base(context)
        {
        }

        /// <inheritdoc />
        public async Task<PagedResults<WishlistItem>> GetPendingByUserAsync(string userId, RequestDto<WithOutFilter> body)
        {
            try
            {
                IQueryable<WishlistItem> query = _entities
                    .Where(w => w.UserId == userId && !w.IsAchieved)
                    .OrderBy(w => w.Priority)
                    .AsNoTracking();

                var totalCount = await query.CountAsync();
                var pageItems = await query
                    .Skip((body.PageNumber - 1) * body.PageSize)
                    .Take(body.PageSize)
                    .ToListAsync();

                return new PagedResults<WishlistItem>
                {
                    Items = pageItems,
                    PageNumber = body.PageNumber,
                    PageSize = body.PageSize,
                    TotalCount = totalCount
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching wishlist items: {ex.Message}", ex);
            }
        }

        /// <inheritdoc />
        public async Task<PagedResults<WishlistItem>> GetAchievedByUserAsync(string userId, RequestDto<WithOutFilter> body)
        {
            try
            {
                IQueryable<WishlistItem> query = _entities
                    .Where(w => w.UserId == userId && w.IsAchieved)
                    .OrderByDescending(w => w.Priority)
                    .AsNoTracking();

                var totalCount = await query.CountAsync();
                var pageItems = await query
                    .Skip((body.PageNumber - 1) * body.PageSize)
                    .Take(body.PageSize)
                    .ToListAsync();

                return new PagedResults<WishlistItem>
                {
                    Items = pageItems,
                    PageNumber = body.PageNumber,
                    PageSize = body.PageSize,
                    TotalCount = totalCount
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching achieved wishlist items: {ex.Message}", ex);
            }
        }

        /// <inheritdoc />
        public async Task<List<WishlistItem>> GetAllPendingAsync(string userId)
        {
            return await _entities
                .Where(w => w.UserId == userId && !w.IsAchieved)
                .OrderBy(w => w.Priority)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
