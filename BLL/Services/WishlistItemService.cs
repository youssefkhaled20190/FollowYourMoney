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
            var (monthlyAllocation, freeCash) = await GetLatestSnapshotDataAsync(userId);
            var allPending = await _repository.GetAllPendingAsync(userId);

            var dtos = BuildDtosWithEta(pagedResult.Items, allPending, monthlyAllocation, freeCash);

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
                dto.Remaining = ComputeRemaining(i);
                dto.EtaDays = 0;
                dto.EtaLabel = "Achieved";
                dto.RequiredMonthlySaving = 0;
                dto.ActualMonthlySave = 0;
                dto.RequiredPercentage = 0;
                dto.StatusLabel = "Achieved";
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
            var (monthlyAllocation, freeCash) = await GetLatestSnapshotDataAsync(userId);

            return BuildSummaryWithEta(allPending, monthlyAllocation, freeCash);
        }

        // ─── Distribute Surplus Savings to Wishlist Items (Priority Order) ───
        public async Task DistributeSurplusSavingsAsync(string userId, decimal surplus)
        {
            if (surplus <= 0) return;

            var pending = await _repository.GetAllPendingAsync(userId);
            var ordered = pending.OrderBy(i => i.Priority).ToList();

            foreach (var item in ordered)
            {
                var remaining = item.TargetAmount - item.SavedAmount;
                if (remaining <= 0) continue;

                var allocation = Math.Min(surplus, remaining);
                item.SavedAmount += allocation;
                surplus -= allocation;

                if (item.SavedAmount >= item.TargetAmount)
                {
                    item.IsAchieved = true;
                }

                await _repository.UpdateAsync(item);

                if (surplus <= 0) break;
            }
        }

        // ─── Create ──────────────────────────────────────────────────────
        public async Task<WishlistItemDto?> CreateAsync(WishlistItemDto dto, string userId)
        {
            var entity = _mapper.Map<WishlistItem>(dto);
            entity.UserId = userId;
            entity.IsAchieved = false;
            entity.DueDate = dto.DueDate;
            entity.IsCritical = dto.IsCritical;
            entity.SavePercentage = dto.SavePercentage;
            var created = await _repository.AddAsync(entity);
            var createdDto = _mapper.Map<WishlistItemDto>(created);
            // 1. Fetch latest snapshot data and all pending items for the calculations
            var (monthlyAllocation, freeCash) = await GetLatestSnapshotDataAsync(userId);
            var allPending = await _repository.GetAllPendingAsync(userId);
            // 2. Compute ETA Map
            var etaMap = ComputeEtaMap(allPending, monthlyAllocation);
            if (etaMap.TryGetValue(created.ItemId, out var eta))
            {
                createdDto.EtaDays = eta.Days;
                createdDto.EtaLabel = eta.Label;
            }
            else
            {
                createdDto.EtaDays = 0;
                createdDto.EtaLabel = "Achieved";
            }
            // 3. Compute Date-based savings (Remaining, RequiredMonthlySaving, etc.)
            PopulateDateBasedSavings(created, createdDto, freeCash, monthlyAllocation);
            return createdDto;
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
            existing.DueDate = dto.DueDate;
            existing.IsCritical = dto.IsCritical;
            existing.SavePercentage = dto.SavePercentage;

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

        // ─── Computation Helpers ─────────────────────────────────────────

        /// <summary>
        /// Computes Remaining in the service layer (not the model).
        /// </summary>
        private static decimal ComputeRemaining(WishlistItem item)
            => Math.Max(0, item.TargetAmount - item.SavedAmount);

        /// <summary>
        /// Gets the monthly savings allocation and free cash from the user's latest snapshot.
        /// Falls back to 0 if no snapshot exists.
        /// </summary>
        private async Task<(decimal AllocatedToWishlist, decimal FreeCash)> GetLatestSnapshotDataAsync(string userId)
        {
            var paged = await _snapshotRepository.GetLatestSnapshotAsync(userId,
                new RequestDto<DAL.Filter.MonthlySnapshotFilter> { PageNumber = 1, PageSize = 1 });
            var snapshot = paged.Items.FirstOrDefault();
            return (snapshot?.AllocatedToWishlist ?? 0m, snapshot?.FreeCash ?? 0m);
        }

        private void PopulateDateBasedSavings(WishlistItem item, WishlistItemDto dto, decimal freeCash, decimal monthlyAllocation)
        {
            dto.Remaining = ComputeRemaining(item);
            dto.ActualMonthlySave = monthlyAllocation;
            dto.IsCritical = item.IsCritical;

            if (dto.Remaining <= 0)
            {
                dto.RequiredMonthlySaving = 0;
                dto.RequiredPercentage = 0;
                dto.StatusLabel = "Achieved";
                return;
            }

            if (item.DueDate.HasValue)
            {
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var monthsRemaining = ((item.DueDate.Value.Year - today.Year) * 12) + item.DueDate.Value.Month - today.Month;
                monthsRemaining = Math.Max(1, monthsRemaining);

                dto.RequiredMonthlySaving = dto.Remaining / monthsRemaining;
                dto.RequiredPercentage = freeCash > 0 ? (dto.RequiredMonthlySaving / freeCash) * 100m : 0m;

                var totalDaysToDueDate = (item.DueDate.Value.ToDateTime(TimeOnly.MinValue) - DateTime.UtcNow).Days;

                if (dto.EtaDays >= 0 && dto.EtaDays <= totalDaysToDueDate)
                {
                    dto.StatusLabel = "On Track";
                }
                else
                {
                    dto.StatusLabel = totalDaysToDueDate <= 60 ? "Critical" : "Behind";
                }
            }
            else
            {
                dto.RequiredMonthlySaving = 0;
                dto.RequiredPercentage = 0;
                dto.StatusLabel = "No Target Date";
            }
        }

        private void PopulateDateBasedSavingsSummary(WishlistItem item, WishlistSummaryDto dto, decimal freeCash, decimal monthlyAllocation)
        {
            dto.Remaining = ComputeRemaining(item);
            dto.ActualMonthlySave = monthlyAllocation;
            dto.IsCritical = item.IsCritical;

            if (dto.Remaining <= 0)
            {
                dto.RequiredMonthlySaving = 0;
                dto.RequiredPercentage = 0;
                dto.StatusLabel = "Achieved";
                return;
            }

            if (item.DueDate.HasValue)
            {
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var monthsRemaining = ((item.DueDate.Value.Year - today.Year) * 12) + item.DueDate.Value.Month - today.Month;
                monthsRemaining = Math.Max(1, monthsRemaining);

                dto.RequiredMonthlySaving = dto.Remaining / monthsRemaining;
                dto.RequiredPercentage = freeCash > 0 ? (dto.RequiredMonthlySaving / freeCash) * 100m : 0m;

                var totalDaysToDueDate = (item.DueDate.Value.ToDateTime(TimeOnly.MinValue) - DateTime.UtcNow).Days;

                if (dto.EtaDays >= 0 && dto.EtaDays <= totalDaysToDueDate)
                {
                    dto.StatusLabel = "On Track";
                }
                else
                {
                    dto.StatusLabel = totalDaysToDueDate <= 60 ? "Critical" : "Behind";
                }
            }
            else
            {
                dto.RequiredMonthlySaving = 0;
                dto.RequiredPercentage = 0;
                dto.StatusLabel = "No Target Date";
            }
        }

        /// <summary>
        /// Computes ETA for each item respecting priority order.
        /// Higher-priority items are funded first; lower-priority items wait.
        /// Returns EtaDays (total days) and a human-readable label.
        /// </summary>
        private List<WishlistItemDto> BuildDtosWithEta(
            List<WishlistItem> pageItems,
            List<WishlistItem> allPending,
            decimal monthlyAllocation,
            decimal freeCash)
        {
            var etaMap = ComputeEtaMap(allPending, monthlyAllocation);

            return pageItems.Select(item =>
            {
                var dto = _mapper.Map<WishlistItemDto>(item);

                if (etaMap.TryGetValue(item.ItemId, out var eta))
                {
                    dto.EtaDays = eta.Days;
                    dto.EtaLabel = eta.Label;
                }
                else
                {
                    dto.EtaDays = 0;
                    dto.EtaLabel = "Achieved";
                }

                PopulateDateBasedSavings(item, dto, freeCash, monthlyAllocation);
                return dto;
            }).ToList();
        }

        private List<WishlistSummaryDto> BuildSummaryWithEta(
            List<WishlistItem> allPending,
            decimal monthlyAllocation,
            decimal freeCash)
        {
            var etaMap = ComputeEtaMap(allPending, monthlyAllocation);

            return allPending.Select(item =>
            {
                var eta = etaMap.TryGetValue(item.ItemId, out var e) ? e : new EtaResult(0, "Achieved");
                var dto = new WishlistSummaryDto
                {
                    ItemId = item.ItemId,
                    Name = item.Name,
                    Priority = item.Priority,
                    TargetAmount = item.TargetAmount,
                    SavedAmount = item.SavedAmount,
                    Remaining = ComputeRemaining(item),
                    EtaDays = eta.Days,
                    EtaLabel = eta.Label,
                    DueDate = item.DueDate,
                    SavePercentage = item.SavePercentage
                };
                PopulateDateBasedSavingsSummary(item, dto, freeCash, monthlyAllocation);
                return dto;
            }).ToList();
        }

        // ─── ETA Core Algorithm ──────────────────────────────────────────

        private record EtaResult(int Days, string Label);

        /// <summary>
        /// ETA algorithm:
        /// Items are ordered by Priority (1 = most important).
        /// The top-priority item gets the full monthly allocation until paid off.
        /// Once it's achieved, the next item starts.
        /// EtaDays[n] = cumulative days needed for items 1..n.
        ///
        /// Uses a daily saving rate: monthlyAllocation / 30.
        /// </summary>
        private static Dictionary<int, EtaResult> ComputeEtaMap(
            List<WishlistItem> ordered,
            decimal monthlyAllocation)
        {
            var map = new Dictionary<int, EtaResult>();

            if (monthlyAllocation <= 0)
            {
                foreach (var i in ordered)
                    map[i.ItemId] = new EtaResult(-1, "No savings allocated");
                return map;
            }

            var dailySavingRate = monthlyAllocation / 30m;
            decimal cumulativeDays = 0m;

            foreach (var item in ordered)
            {
                var remaining = item.TargetAmount - item.SavedAmount;
                if (remaining <= 0)
                {
                    map[item.ItemId] = new EtaResult(0, "Achieved");
                    continue;
                }

                var daysForThis = remaining / dailySavingRate;
                cumulativeDays += daysForThis;

                var totalDays = (int)Math.Ceiling(cumulativeDays);
                map[item.ItemId] = new EtaResult(totalDays, FormatEtaLabel(totalDays));
            }

            return map;
        }

        /// <summary>
        /// Converts total days into a human-readable label:
        /// - Less than 7 days  → "X days"
        /// - Less than 5 weeks → "X weeks Y days"  (Y omitted if 0)
        /// - Less than 12 months → "X months Y weeks"  (Y omitted if 0)
        /// - 12+ months → "X years Y months"  (Y omitted if 0)
        /// </summary>
        internal static string FormatEtaLabel(int totalDays)
        {
            if (totalDays <= 0) return "Achieved";

            if (totalDays < 7)
                return $"{totalDays} day{(totalDays != 1 ? "s" : "")}";

            if (totalDays < 35) // < ~5 weeks
            {
                var weeks = totalDays / 7;
                var days = totalDays % 7;
                var label = $"{weeks} week{(weeks != 1 ? "s" : "")}";
                if (days > 0) label += $" {days} day{(days != 1 ? "s" : "")}";
                return label;
            }

            // Use 30-day months for readability
            var months = totalDays / 30;
            var remainingDays = totalDays % 30;
            var remainingWeeks = remainingDays / 7;

            if (months < 12)
            {
                var label = $"{months} month{(months != 1 ? "s" : "")}";
                if (remainingWeeks > 0) label += $" {remainingWeeks} week{(remainingWeeks != 1 ? "s" : "")}";
                return label;
            }

            // Years
            var years = months / 12;
            var remMonths = months % 12;
            var label2 = $"{years} year{(years != 1 ? "s" : "")}";
            if (remMonths > 0) label2 += $" {remMonths} month{(remMonths != 1 ? "s" : "")}";
            return label2;
        }
    }
}
