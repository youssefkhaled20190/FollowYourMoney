using AutoMapper;
using DAL.Interfaces;
using DAL.Model;
using Shared.DTO;
using SharedLib.Helper;

namespace BLL.Services
{
    public class WishlistItemService
    {
        private readonly IWishlistItemRepository _repository;
        private readonly IMonthlySnapshotRepository _snapshotRepository;
        private readonly IMapper _mapper;

        public WishlistItemService(
            IWishlistItemRepository repository,
            IMonthlySnapshotRepository snapshotRepository,
            IMapper mapper)
        {
            _repository = repository;
            _snapshotRepository = snapshotRepository;
            _mapper = mapper;
        }

        // ─── Get pending items with ETA ──────────────────────────────────
        public async Task<PagedResults<WishlistItemDto>> GetPendingByUserAsync(string userId, RequestDto<WithOutFilter> body)
        {
            var pagedResult = await _repository.GetPendingByUserAsync(userId, body);
            var monthlyAllocation = await GetMonthlyAllocationAsync(userId);
            var allPending = await _repository.GetAllPendingAsync(userId);

            var dtos = BuildDtosWithEta(pagedResult.Items, allPending, monthlyAllocation);

            return new PagedResults<WishlistItemDto>
            {
                Items = dtos,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            };
        }

        // ─── Get achieved items ──────────────────────────────────────────
        public async Task<PagedResults<WishlistItemDto>> GetAchievedByUserAsync(string userId, RequestDto<WithOutFilter> body)
        {
            var pagedResult = await _repository.GetAchievedByUserAsync(userId, body);
            var dtos = pagedResult.Items.Select(i =>
            {
                var dto = _mapper.Map<WishlistItemDto>(i);
                dto.EtaMonths = 0;
                return dto;
            }).ToList();

            return new PagedResults<WishlistItemDto>
            {
                Items = dtos,
                PageNumber = pagedResult.PageNumber,
                PageSize = pagedResult.PageSize,
                TotalCount = pagedResult.TotalCount
            };
        }

        // ─── Build a WishlistSummary list (for MonthlySnapshot detail) ───
        public async Task<List<WishlistSummaryDto>> BuildSummaryAsync(string userId)
        {
            var allPending = await _repository.GetAllPendingAsync(userId);
            var monthlyAllocation = await GetMonthlyAllocationAsync(userId);

            return BuildSummaryWithEta(allPending, monthlyAllocation);
        }

        // ─── Create ──────────────────────────────────────────────────────
        public async Task<WishlistItemDto?> CreateAsync(WishlistItemDto dto, string userId)
        {
            var entity = _mapper.Map<WishlistItem>(dto);
            entity.UserId = userId;
            entity.IsAchieved = false;

            var created = await _repository.AddAsync(entity);
            return _mapper.Map<WishlistItemDto>(created);
        }

        // ─── Update ──────────────────────────────────────────────────────
        public async Task<bool> UpdateAsync(WishlistItemDto dto, string userId)
        {
            var existing = await _repository.GetByIdAsync(dto.ItemId)
                ?? throw new ArgumentException("Wishlist item not found.");

            if (existing.UserId != userId)
                throw new UnauthorizedAccessException("You do not own this wishlist item.");

            existing.Name = dto.Name;
            existing.TargetAmount = dto.TargetAmount;
            existing.SavedAmount = dto.SavedAmount;
            existing.Priority = dto.Priority;

            // Auto-achieve when saved reaches target
            if (existing.SavedAmount >= existing.TargetAmount)
                existing.IsAchieved = true;

            return await _repository.UpdateAsync(existing);
        }

        // ─── Mark explicitly achieved ─────────────────────────────────────
        public async Task<bool> MarkAchievedAsync(int itemId, string userId)
        {
            var existing = await _repository.GetByIdAsync(itemId)
                ?? throw new ArgumentException("Wishlist item not found.");

            if (existing.UserId != userId)
                throw new UnauthorizedAccessException("You do not own this wishlist item.");

            existing.IsAchieved = true;
            return await _repository.UpdateAsync(existing);
        }

        // ─── Delete ──────────────────────────────────────────────────────
        public async Task<bool> DeleteAsync(int itemId, string userId)
        {
            var existing = await _repository.GetByIdAsync(itemId)
                ?? throw new ArgumentException("Wishlist item not found.");

            if (existing.UserId != userId)
                throw new UnauthorizedAccessException("You do not own this wishlist item.");

            return await _repository.DeleteAsync(itemId);
        }

        // ─── ETA Helpers ──────────────────────────────────────────────────

        /// <summary>
        /// Gets the monthly savings allocation from the user's latest snapshot.
        /// Falls back to 0 if no snapshot exists.
        /// </summary>
        private async Task<decimal> GetMonthlyAllocationAsync(string userId)
        {
            var snapshot = await _snapshotRepository.GetLatestSnapshotAsync(userId);
            return snapshot?.AllocatedToWishlist ?? 0m;
        }

        /// <summary>
        /// Computes ETA for each item respecting priority order.
        /// Higher-priority items are funded first; lower-priority items wait.
        /// </summary>
        private List<WishlistItemDto> BuildDtosWithEta(
            List<WishlistItem> pageItems,
            List<WishlistItem> allPending,
            decimal monthlyAllocation)
        {
            // Build cumulative "months to wait" per item based on priority order
            var etaMap = ComputeEtaMap(allPending, monthlyAllocation);

            return pageItems.Select(item =>
            {
                var dto = _mapper.Map<WishlistItemDto>(item);
                dto.EtaMonths = etaMap.TryGetValue(item.ItemId, out var eta) ? eta : 0m;
                return dto;
            }).ToList();
        }

        private List<WishlistSummaryDto> BuildSummaryWithEta(
            List<WishlistItem> allPending,
            decimal monthlyAllocation)
        {
            var etaMap = ComputeEtaMap(allPending, monthlyAllocation);

            return allPending.Select(item => new WishlistSummaryDto
            {
                ItemId = item.ItemId,
                Name = item.Name,
                Priority = item.Priority,
                TargetAmount = item.TargetAmount,
                SavedAmount = item.SavedAmount,
                EtaMonths = etaMap.TryGetValue(item.ItemId, out var eta) ? eta : 0m
            }).ToList();
        }

        /// <summary>
        /// ETA algorithm:
        /// Items are ordered by Priority (1 = most important).
        /// The top-priority item gets the full monthly allocation until paid off.
        /// Once it's achieved, the next item starts.
        /// EtaMonths[n] = sum of months needed for items 1..n.
        /// </summary>
        private static Dictionary<int, decimal> ComputeEtaMap(
            List<WishlistItem> ordered,
            decimal monthlyAllocation)
        {
            var map = new Dictionary<int, decimal>();
            if (monthlyAllocation <= 0)
            {
                foreach (var i in ordered) map[i.ItemId] = 0m;
                return map;
            }

            decimal cumulativeMonths = 0m;
            foreach (var item in ordered)
            {
                var remaining = item.TargetAmount - item.SavedAmount;
                if (remaining <= 0)
                {
                    map[item.ItemId] = 0m;
                    continue;
                }
                var monthsForThis = remaining / monthlyAllocation;
                cumulativeMonths += monthsForThis;
                map[item.ItemId] = cumulativeMonths;
            }

            return map;
        }
    }
}
