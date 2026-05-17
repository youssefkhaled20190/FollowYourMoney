using DAL.Model;
using Shared.DTO;
using SharedLib.Helper;

namespace DAL.Interfaces
{
    public interface IWishlistItemRepository : IGeneric<WishlistItem>
    {
        /// <summary>Returns pending (not achieved) wishlist items ordered by Priority ascending.</summary>
        Task<PagedResults<WishlistItem>> GetPendingByUserAsync(string userId, RequestDto<WithOutFilter> body);

        /// <summary>Returns already-achieved wishlist items, newest first.</summary>
        Task<PagedResults<WishlistItem>> GetAchievedByUserAsync(string userId, RequestDto<WithOutFilter> body);

        /// <summary>Returns ALL pending items (unfiltered) — used internally for ETA calculation.</summary>
        Task<List<WishlistItem>> GetAllPendingAsync(string userId);
    }
}
