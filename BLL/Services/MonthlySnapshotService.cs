using AutoMapper;
using DAL.Enums;
using DAL.Filter;
using DAL.Interfaces;
using DAL.Model;
using Shared.DTO;
using SharedLib.Helper;

namespace BLL.Services
{
    public class MonthlySnapshotService
    {
        private readonly IMonthlySnapshotRepository _snapshotRepository;
        private readonly IWeeklyBudgetRepository _weeklyBudgetRepository;
        private readonly IGameyaRepository _gameyaRepository;
        private readonly IInstallmentRepository _installmentRepository;
        private readonly WishlistItemService _wishlistItemService;
        private readonly GameyaService _gameyaService;
        private readonly IMapper _mapper;

        public MonthlySnapshotService(
            IMonthlySnapshotRepository snapshotRepository,
            IWeeklyBudgetRepository weeklyBudgetRepository,
            IGameyaRepository gameyaRepository,
            IInstallmentRepository installmentRepository,
            WishlistItemService wishlistItemService,
            GameyaService gameyaService,
            IMapper mapper)
        {
            _snapshotRepository = snapshotRepository;
            _weeklyBudgetRepository = weeklyBudgetRepository;
            _gameyaRepository = gameyaRepository;
            _installmentRepository = installmentRepository;
            _wishlistItemService = wishlistItemService;
            _gameyaService = gameyaService;
            _mapper = mapper;
        }

        // ─── Get Latest Snapshot (full detail, with optional year/month filter) ──
        /// <summary>
        /// Returns the first snapshot matching the filter.
        /// If no year/month filter is provided, returns the most recent snapshot.
        /// The frontend can use this to both:
        ///   - Load the latest plan on mount (no filter)
        ///   - Load a specific month's plan (year + month filter)
        /// </summary>
        public async Task<MonthlySnapshotDto?> GetLatestAsync(string userId, RequestDto<MonthlySnapshotFilter> body)
        {
            var paged = await _snapshotRepository.GetLatestSnapshotAsync(userId, body);

            // Take the first item (already ordered by CreatedAt desc in the repo)
            var entity = paged.Items.FirstOrDefault();
            if (entity is null) return null;

            return await MapToDetailDtoAsync(entity, userId);
        }

        // ─── Get History (paged) ─────────────────────────────────────────
        public async Task<PagedResults<MonthlySnapshotDto>> GetHistoryAsync(string userId, RequestDto<MonthlySnapshotFilter> body)
        {
            var paged = await _snapshotRepository.GetuserSnapshotsAsync(userId, body);

            // Fetch gameyas, installments, and wishlist summary once to reuse for all items on this page
            await _gameyaService.CheckAndDeactivateExpiredAsync(userId);

            var gameyasPage = await _gameyaRepository.GetActiveByUserAsync(userId,
                new RequestDto<WithOutFilter> { PageNumber = 1, PageSize = 1000 });
            var activeGameyas = gameyasPage.Items.ToList();

            var installmentsPage = await _installmentRepository.GetActiveByUserAsync(userId,
                new RequestDto<WithOutFilter> { PageNumber = 1, PageSize = 1000 });
            var activeInstallments = installmentsPage.Items.ToList();

            var wishlistSummary = await _wishlistItemService.BuildSummaryAsync(userId);

            var dtos = new List<MonthlySnapshotDto>();
            foreach (var s in paged.Items)
            {
                var dto = await MapToDetailDtoAsync(s, userId, activeGameyas, activeInstallments, wishlistSummary);
                dtos.Add(dto);
            }

            return new PagedResults<MonthlySnapshotDto>
            {
                Items = dtos,
                PageNumber = paged.PageNumber,
                PageSize = paged.PageSize,
                TotalCount = paged.TotalCount
            };
        }

        // ─── Create New Monthly Plan ─────────────────────────────────────
        /// <summary>
        /// Creates a new MonthlySnapshot:
        /// 1. Prevents duplicates for same year/month.
        /// 2. Auto-fetches active gameyas + installments to compute TotalCommitments.
        /// 3. FreeCash = TotalIncome - TotalCommitments.
        /// 4. SpendableCash = FreeCash - AllocatedToWishlist - CarryOverGoal.
        /// 5. WeeklyBudget = SpendableCash / 4.
        /// 6. Seeds 4 WeeklyBudget rows.
        /// </summary>
        public async Task<MonthlySnapshotDto?> CreateAsync(CreateSnapshotDto dto, string userId)
        {
            // Guard: prevent duplicate plan for the same month
            var existing = await _snapshotRepository.GetByYearMonthAsync(userId, dto.Year, dto.Month);
            if (existing is not null)
                throw new InvalidOperationException($"A plan for {dto.Year}/{dto.Month:D2} already exists.");

            // Auto-compute commitments (turn-aware)
            var (totalCommitments, totalCashThisMonth) = await ComputeGameyaDetailsAsync(userId, dto.Year, dto.Month);

            // All calculations in service
            var totalIncome = dto.Salary + dto.Bonuses + dto.CarryOver;
            var freeCash = totalIncome - totalCommitments;

            decimal allocatedToWishlist = dto.AllocatedToWishlist;
            if (dto.WishlistPercentage.HasValue)
            {
                allocatedToWishlist = freeCash > 0 ? freeCash * (dto.WishlistPercentage.Value / 100m) : 0m;
            }

            decimal weeklyBudget = 0m;
            if (dto.CustomWeeklyBudget.HasValue)
            {
                weeklyBudget = dto.CustomWeeklyBudget.Value;
            }
            else
            {
                var spendableCash = freeCash - allocatedToWishlist - dto.CarryOverGoal;
                weeklyBudget = spendableCash > 0 ? spendableCash / 4 : 0;
            }

            var snapshot = new MonthlySnapshot
            {
                UserId = userId,
                Year = dto.Year,
                Month = dto.Month,
                Salary = dto.Salary,
                Bonuses = dto.Bonuses,
                CarryOver = dto.CarryOver,
                CarryOverGoal = dto.CarryOverGoal,
                TotalCommitments = totalCommitments,
                TotalCashThisMonth = totalCashThisMonth,
                FreeCash = freeCash,
                AllocatedToWishlist = allocatedToWishlist,
                WeeklyBudget = weeklyBudget,
                CustomWeeklyBudget = dto.CustomWeeklyBudget,
                WishlistPercentage = dto.WishlistPercentage,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _snapshotRepository.AddAsync(snapshot);

            // Seed the 4 weekly budget rows
            var weeks = BuildWeekRows(created.SnapshotId, dto.Year, dto.Month, weeklyBudget);
            foreach (var w in weeks)
                await _weeklyBudgetRepository.AddAsync(w);

            return _mapper.Map<MonthlySnapshotDto>(created);
        }

        // ─── Edit Monthly Blueprint ──────────────────────────────────────
        public async Task<MonthlySnapshotDto?> UpdateAsync(EditSnapshotDto dto, string userId)
        {
            var snapshot = await _snapshotRepository.GetByIdAsync(dto.SnapshotId)
                ?? throw new InvalidOperationException("Monthly plan not found.");

            if (snapshot.UserId != userId)
                throw new UnauthorizedAccessException("You do not own this monthly plan.");

            // Auto-compute commitments (turn-aware)
            var (totalCommitments, totalCashThisMonth) = await ComputeGameyaDetailsAsync(userId, snapshot.Year, snapshot.Month);

            snapshot.Salary = dto.Salary;
            snapshot.Bonuses = dto.Bonuses;
            snapshot.CarryOver = dto.CarryOver;
            snapshot.CarryOverGoal = dto.CarryOverGoal;
            snapshot.CustomWeeklyBudget = dto.CustomWeeklyBudget;
            snapshot.WishlistPercentage = dto.WishlistPercentage;

            var totalIncome = dto.Salary + dto.Bonuses + dto.CarryOver;
            var freeCash = totalIncome - totalCommitments;

            decimal allocatedToWishlist = dto.AllocatedToWishlist;
            if (dto.WishlistPercentage.HasValue)
            {
                allocatedToWishlist = freeCash > 0 ? freeCash * (dto.WishlistPercentage.Value / 100m) : 0m;
            }

            decimal weeklyBudget = 0m;
            if (dto.CustomWeeklyBudget.HasValue)
            {
                weeklyBudget = dto.CustomWeeklyBudget.Value;
            }
            else
            {
                var spendableCash = freeCash - allocatedToWishlist - dto.CarryOverGoal;
                weeklyBudget = spendableCash > 0 ? spendableCash / 4 : 0;
            }

            snapshot.TotalCommitments = totalCommitments;
            snapshot.TotalCashThisMonth = totalCashThisMonth;
            snapshot.FreeCash = freeCash;
            snapshot.AllocatedToWishlist = allocatedToWishlist;
            snapshot.WeeklyBudget = weeklyBudget;

            // Update the existing 4 weekly budget rows
            var allWeeks = await _weeklyBudgetRepository.GetBySnapshotAsync(snapshot.SnapshotId, userId);
            foreach (var week in allWeeks)
            {
                week.BudgetAmount = weeklyBudget;
                await _weeklyBudgetRepository.UpdateAsync(week);
            }

            await _snapshotRepository.UpdateAsync(snapshot);

            // Fetch the updated full detail including weekly budgets & triggers
            var latestPaged = await _snapshotRepository.GetLatestSnapshotAsync(userId,
                new RequestDto<MonthlySnapshotFilter>
                {
                    PageNumber = 1,
                    PageSize = 1,
                    Filter = new MonthlySnapshotFilter { Year = snapshot.Year, Month = snapshot.Month }
                });

            var entity = latestPaged.Items.FirstOrDefault();
            if (entity is null) return null;

            return await MapToDetailDtoAsync(entity, userId);
        }

        // ─── Mid-month Replan ────────────────────────────────────────────
        /// <summary>
        /// User declares how much cash they have right now.
        /// The system:
        ///   1. Finds the current week number.
        ///   2. If CarryOverGoal is provided, updates it on the snapshot.
        ///   3. Redistributes (cashInHand - carryOverGoal) evenly across remaining weeks.
        ///   4. Records a SnapshotTrigger.
        ///   5. Updates FreeCash + WeeklyBudget on the snapshot.
        /// </summary>
        public async Task<MonthlySnapshotDto?> RePlanAsync(string userId, RePlanDto dto)
        {
            // Get latest snapshot (no filter — always the most recent)
            var latestPaged = await _snapshotRepository.GetLatestSnapshotAsync(userId,
                new RequestDto<MonthlySnapshotFilter> { PageNumber = 1, PageSize = 1 });
            var snapshot = latestPaged.Items.FirstOrDefault()
                ?? throw new InvalidOperationException("No active monthly plan found. Please create one first.");

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Find remaining weeks (WeekEnd >= today) directly from the loaded WeeklyBudgets
            var remainingWeeks = snapshot.WeeklyBudgets
                .Where(w => w.WeekEnd >= today)
                .OrderBy(w => w.WeekNumber)
                .ToList();

            if (!remainingWeeks.Any())
                throw new InvalidOperationException("No remaining weeks in this plan to redistribute.");

            // Update CarryOverGoal if provided explicitly in the replan request (saving target is protected and not altered by the automatic redistribution logic)
            if (dto.CarryOverGoal.HasValue)
                snapshot.CarryOverGoal = dto.CarryOverGoal.Value;

            decimal carryOverGoal = snapshot.CarryOverGoal;

            // Calculate expected cash before this replan based on what should be saved + what remains unspent
            decimal totalBudget = snapshot.WeeklyBudgets.Sum(w => w.BudgetAmount);
            decimal totalSpent = snapshot.WeeklyBudgets.Sum(w => w.Expenses?.Sum(e => e.Amount) ?? 0m);
            decimal expectedCash = carryOverGoal + snapshot.AllocatedToWishlist + (totalBudget - totalSpent);

            decimal cashInHand = dto.CashInHand;

            if (cashInHand > expectedCash)
            {
                // Surplus: cash is higher than expected (e.g. bonus, raise, or unexpected savings)
                decimal surplus = cashInHand - expectedCash;

                // If WishlistPercentage exists (or we can initialize it), increase it by 20% (capped at 100%)
                snapshot.WishlistPercentage = Math.Min(100m, (snapshot.WishlistPercentage ?? 0m) + 20m);

                // Surplus reflects directly in the wishlist target as requested
                snapshot.AllocatedToWishlist += surplus;

                // Distribute the surplus savings to the pending wishlist items
                await _wishlistItemService.DistributeSurplusSavingsAsync(userId, surplus);

                // The remaining weeks keep their existing budget amounts
                snapshot.FreeCash = cashInHand;
                snapshot.WeeklyBudget = remainingWeeks.Average(w => w.BudgetAmount);
            }
            else
            {
                // Deficit: cash is lower than expected
                // Preserve CarryOverGoal, and proportionally scale down the wishlist target and remaining weekly budgets
                decimal remainingCash = Math.Max(0m, cashInHand - carryOverGoal);

                decimal currentWishlistAlloc = snapshot.AllocatedToWishlist;
                decimal currentRemainingWeeksBudgetTotal = remainingWeeks.Sum(w => w.BudgetAmount);
                decimal totalNeeds = currentWishlistAlloc + currentRemainingWeeksBudgetTotal;

                decimal newWishlistAlloc = 0m;
                decimal newRemainingWeeksBudgetTotal = 0m;

                if (remainingCash > 0m)
                {
                    if (totalNeeds > 0m)
                    {
                        // Calculate percentage ratio and redistribute
                        decimal wishlistRatio = currentWishlistAlloc / totalNeeds;
                        newWishlistAlloc = remainingCash * wishlistRatio;
                        newRemainingWeeksBudgetTotal = remainingCash - newWishlistAlloc;
                    }
                    else
                    {
                        newRemainingWeeksBudgetTotal = remainingCash;
                    }
                }

                snapshot.AllocatedToWishlist = newWishlistAlloc;

                // Redistribute remaining week budgets proportionally based on previous week percentages
                if (currentRemainingWeeksBudgetTotal > 0m)
                {
                    foreach (var week in remainingWeeks)
                    {
                        decimal weekRatio = week.BudgetAmount / currentRemainingWeeksBudgetTotal;
                        week.BudgetAmount = newRemainingWeeksBudgetTotal * weekRatio;
                    }
                }
                else
                {
                    decimal equalWeekAmount = newRemainingWeeksBudgetTotal / remainingWeeks.Count;
                    foreach (var week in remainingWeeks)
                    {
                        week.BudgetAmount = equalWeekAmount;
                    }
                }

                snapshot.FreeCash = cashInHand;
                snapshot.WeeklyBudget = remainingWeeks.Average(w => w.BudgetAmount);
            }

            // Record the trigger
            snapshot.Triggers.Add(new SnapshotTrigger
            {
                SnapshotId = snapshot.SnapshotId,
                TriggerType = TriggerType.ArbitraryAction,
                CashInHand = dto.CashInHand,
                Note = dto.Note,
                CreatedAt = DateTime.UtcNow
            });

            await _snapshotRepository.UpdateAsync(snapshot);

            return await MapToDetailDtoAsync(snapshot, userId);
        }

        // ─── Helpers ─────────────────────────────────────────────────────

        /// <summary>
        /// Computes total commitments and total cash received this month from Gameyas.
        /// For each active Gameya, determines which month number corresponds to the snapshot's year/month.
        /// The user ALWAYS pays their MonthlyContribution (included in commitments) — they only stop
        /// paying when the Gameya ends (deactivated by CheckAndDeactivateExpiredAsync).
        /// If that month == MyTurn, the user also receives the pot (MonthlyContribution × TotalMembers)
        /// which is surfaced as TotalCashThisMonth (display-only, not in FreeCash calc).
        /// </summary>
        private async Task<(decimal totalCommitments, decimal totalCashThisMonth)> ComputeGameyaDetailsAsync(
            string userId, 
            int year, 
            int month,
            List<Gameya>? activeGameyas = null,
            List<Installment>? activeInstallments = null)
        {
            if (activeGameyas == null || activeInstallments == null)
            {
                // Auto-deactivate expired gameyas before computing
                await _gameyaService.CheckAndDeactivateExpiredAsync(userId);

                var gameyasPage = await _gameyaRepository.GetActiveByUserAsync(userId,
                    new RequestDto<WithOutFilter> { PageNumber = 1, PageSize = 1000 });
                activeGameyas = gameyasPage.Items.ToList();

                var installmentsPage = await _installmentRepository.GetActiveByUserAsync(userId,
                    new RequestDto<WithOutFilter> { PageNumber = 1, PageSize = 1000 });
                activeInstallments = installmentsPage.Items.ToList();
            }

            var snapshotDate = new DateOnly(year, month, 1);
            decimal totalCashThisMonth = 0m;

            // User always pays their contribution for every active Gameya
            var gameyaCommitments = activeGameyas.Sum(g => g.MonthlyContribution);

            // Check if any Gameya's turn falls this month → user receives the pot
            foreach (var g in activeGameyas)
            {
                // Calculate which month number of this Gameya falls in the snapshot's month
                // Month 1 = StartDate, Month 2 = StartDate + 1 month, etc.
                int monthsDiff = ((snapshotDate.Year - g.StartDate.Year) * 12) + (snapshotDate.Month - g.StartDate.Month);
                int gameyaMonthNumber = monthsDiff + 1; // 1-based

                if (gameyaMonthNumber >= 1 && gameyaMonthNumber <= g.TotalMembers && gameyaMonthNumber == g.MyTurn)
                {
                    // User receives the pot this month (on top of still paying their contribution)
                    totalCashThisMonth += g.MonthlyContribution * g.TotalMembers;
                }
            }

            var installmentTotal = activeInstallments.Sum(i => i.MonthlyAmount);

            return (gameyaCommitments + installmentTotal, totalCashThisMonth);
        }

        /// <summary>
        /// Builds 4 WeeklyBudget rows with calendar-aligned date ranges for the given year/month.
        /// Week boundaries: 1–7, 8–14, 15–21, 22–end-of-month.
        /// </summary>
        private static List<WeeklyBudget> BuildWeekRows(int snapshotId, int year, int month, decimal weeklyAmount)
        {
            var daysInMonth = DateTime.DaysInMonth(year, month);
            return new List<WeeklyBudget>
            {
                new() { SnapshotId = snapshotId, WeekNumber = 1, BudgetAmount = weeklyAmount,
                        WeekStart = new DateOnly(year, month, 1),  WeekEnd = new DateOnly(year, month, 7)  },
                new() { SnapshotId = snapshotId, WeekNumber = 2, BudgetAmount = weeklyAmount,
                        WeekStart = new DateOnly(year, month, 8),  WeekEnd = new DateOnly(year, month, 14) },
                new() { SnapshotId = snapshotId, WeekNumber = 3, BudgetAmount = weeklyAmount,
                        WeekStart = new DateOnly(year, month, 15), WeekEnd = new DateOnly(year, month, 21) },
                new() { SnapshotId = snapshotId, WeekNumber = 4, BudgetAmount = weeklyAmount,
                        WeekStart = new DateOnly(year, month, 22), WeekEnd = new DateOnly(year, month, daysInMonth) },
            };
        }

        private async Task<MonthlySnapshotDto> MapToDetailDtoAsync(
            MonthlySnapshot entity, 
            string userId,
            List<Gameya>? activeGameyas = null,
            List<Installment>? activeInstallments = null,
            List<WishlistSummaryDto>? wishlistSummary = null)
        {
            var dto = _mapper.Map<MonthlySnapshotDto>(entity);

            // Recalculate commitments and Gameya cash dynamically so it reflects recent changes
            var (totalCommitments, totalCashThisMonth) = await ComputeGameyaDetailsAsync(userId, entity.Year, entity.Month, activeGameyas, activeInstallments);
            dto.TotalCommitments = totalCommitments;
            dto.TotalCashThisMonth = totalCashThisMonth;
            
            bool hasReplan = entity.Triggers != null && entity.Triggers.Any(t => t.TriggerType == TriggerType.ArbitraryAction);
            
            if (hasReplan)
            {
                // If the user replanned, we preserve the cash-in-hand figures saved in the database
                dto.FreeCash = entity.FreeCash;
                dto.AllocatedToWishlist = entity.AllocatedToWishlist;
                dto.WeeklyBudget = entity.WeeklyBudget;
            }
            else
            {
                var totalIncome = entity.Salary + entity.Bonuses + entity.CarryOver;
                dto.FreeCash = totalIncome - totalCommitments;
                
                if (entity.WishlistPercentage.HasValue)
                {
                    dto.AllocatedToWishlist = dto.FreeCash > 0 ? dto.FreeCash * (entity.WishlistPercentage.Value / 100m) : 0m;
                }
                else
                {
                    dto.AllocatedToWishlist = entity.AllocatedToWishlist;
                }

                if (entity.CustomWeeklyBudget.HasValue)
                {
                    dto.WeeklyBudget = entity.CustomWeeklyBudget.Value;
                }
                else
                {
                    var spendableCash = dto.FreeCash - dto.AllocatedToWishlist - entity.CarryOverGoal;
                    dto.WeeklyBudget = spendableCash > 0 ? spendableCash / 4 : 0;
                }
            }

            // Attach weekly budgets with spent amounts (recalculate BudgetAmount if not custom and not replanned)
            dto.WeeklyBudgets = entity.WeeklyBudgets
                .OrderBy(w => w.WeekNumber)
                .Select(w =>
                {
                    var wDto = _mapper.Map<WeeklyBudgetDto>(w);
                    if (!entity.CustomWeeklyBudget.HasValue && !hasReplan)
                    {
                        wDto.BudgetAmount = dto.WeeklyBudget;
                    }
                    else
                    {
                        wDto.BudgetAmount = w.BudgetAmount;
                    }
                    wDto.SpentAmount = w.Expenses?.Sum(e => e.Amount) ?? 0m;

                    // Generate a smart notification note if the user has replanned and the weekly budget changed
                    if (hasReplan)
                    {
                        decimal originalWeeklyBudget = ReconstructOriginalWeeklyBudget(entity, totalCommitments);
                        if (originalWeeklyBudget > 0m && Math.Round(w.BudgetAmount, 2) != Math.Round(originalWeeklyBudget, 2))
                        {
                            if (w.BudgetAmount > originalWeeklyBudget)
                            {
                                decimal increasePercent = ((w.BudgetAmount - originalWeeklyBudget) / originalWeeklyBudget) * 100m;
                                wDto.Note = $"You have more money! You can spend {increasePercent:F0}% more than your original weekly budget.";
                            }
                            else if (w.BudgetAmount < originalWeeklyBudget)
                            {
                                decimal decreasePercent = ((originalWeeklyBudget - w.BudgetAmount) / originalWeeklyBudget) * 100m;
                                wDto.Note = $"Your free cash is less than expected. You should spend {decreasePercent:F0}% less than your original weekly budget.";
                            }
                        }
                    }

                    return wDto;
                }).ToList();

            if (activeGameyas == null || activeInstallments == null)
            {
                var gameyasPage = await _gameyaRepository.GetActiveByUserAsync(userId,
                    new RequestDto<WithOutFilter> { PageNumber = 1, PageSize = 1000 });
                activeGameyas = gameyasPage.Items.ToList();

                var installmentsPage = await _installmentRepository.GetActiveByUserAsync(userId,
                    new RequestDto<WithOutFilter> { PageNumber = 1, PageSize = 1000 });
                activeInstallments = installmentsPage.Items.ToList();
            }

            dto.Gameyas = _mapper.Map<List<GameyaDetailDto>>(activeGameyas);
            dto.Installments = _mapper.Map<List<InstallmentDto>>(activeInstallments);

            if (wishlistSummary == null)
            {
                dto.WishlistSummary = await _wishlistItemService.BuildSummaryAsync(userId);
            }
            else
            {
                dto.WishlistSummary = wishlistSummary;
            }

            return dto;
        }

        private decimal ReconstructOriginalWeeklyBudget(MonthlySnapshot entity, decimal totalCommitments)
        {
            decimal originalFreeCash = (entity.Salary + entity.Bonuses + entity.CarryOver) - totalCommitments;
            
            if (entity.CustomWeeklyBudget.HasValue)
            {
                return entity.CustomWeeklyBudget.Value;
            }

            decimal originalWishlistAlloc = entity.AllocatedToWishlist;

            // If they have a wishlist percentage, we can check if it was increased by 20%
            if (entity.WishlistPercentage.HasValue)
            {
                decimal originalPercentage = entity.WishlistPercentage.Value;
                // If they replanned with a surplus, we know the percentage was increased by 20%
                bool hasReplan = entity.Triggers != null && entity.Triggers.Any(t => t.TriggerType == TriggerType.ArbitraryAction);
                if (hasReplan && entity.FreeCash > originalFreeCash)
                {
                    originalPercentage = Math.Max(0m, originalPercentage - 20m);
                }
                originalWishlistAlloc = originalFreeCash > 0 ? originalFreeCash * (originalPercentage / 100m) : 0m;
            }
            else
            {
                // If no percentage, but they replanned with a surplus, the wishlist alloc was increased by the surplus
                bool hasReplan = entity.Triggers != null && entity.Triggers.Any(t => t.TriggerType == TriggerType.ArbitraryAction);
                if (hasReplan && entity.FreeCash > originalFreeCash)
                {
                    decimal surplus = entity.FreeCash - originalFreeCash;
                    originalWishlistAlloc = Math.Max(0m, entity.AllocatedToWishlist - surplus);
                }
            }

            decimal originalSpendable = originalFreeCash - originalWishlistAlloc - entity.CarryOverGoal;
            return originalSpendable > 0 ? originalSpendable / 4m : 0m;
        }
    }
}
