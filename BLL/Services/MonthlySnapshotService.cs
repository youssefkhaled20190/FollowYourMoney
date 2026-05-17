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
        private readonly IMapper _mapper;

        public MonthlySnapshotService(
            IMonthlySnapshotRepository snapshotRepository,
            IWeeklyBudgetRepository weeklyBudgetRepository,
            IGameyaRepository gameyaRepository,
            IInstallmentRepository installmentRepository,
            WishlistItemService wishlistItemService,
            IMapper mapper)
        {
            _snapshotRepository = snapshotRepository;
            _weeklyBudgetRepository = weeklyBudgetRepository;
            _gameyaRepository = gameyaRepository;
            _installmentRepository = installmentRepository;
            _wishlistItemService = wishlistItemService;
            _mapper = mapper;
        }

        // ─── Get Latest Snapshot (full detail) ──────────────────────────
        public async Task<MonthlySnapshotDto?> GetLatestAsync(string userId)
        {
            var entity = await _snapshotRepository.GetLatestSnapshotAsync(userId);
            if (entity is null) return null;

            return await MapToDetailDtoAsync(entity, userId);
        }

        // ─── Get History (paged) ─────────────────────────────────────────
        public async Task<PagedResults<MonthlySnapshotDto>> GetHistoryAsync(string userId, RequestDto<MonthlySnapshotFilter> body)
        {
            var paged = await _snapshotRepository.GetuserSnapshotsAsync(userId, body);

            var dtos = paged.Items.Select(s => _mapper.Map<MonthlySnapshotDto>(s)).ToList();

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
        /// 4. WeeklyBudget = (FreeCash - AllocatedToWishlist) / 4 (or by calendar weeks).
        /// 5. Seeds 4 WeeklyBudget rows.
        /// </summary>
        public async Task<MonthlySnapshotDto?> CreateAsync(CreateSnapshotDto dto, string userId)
        {
            // Guard: prevent duplicate plan for the same month
            var existing = await _snapshotRepository.GetByYearMonthAsync(userId, dto.Year, dto.Month);
            if (existing is not null)
                throw new InvalidOperationException($"A plan for {dto.Year}/{dto.Month:D2} already exists.");

            // Auto-compute commitments
            var totalCommitments = await ComputeTotalCommitmentsAsync(userId);

            var totalIncome = dto.Salary + dto.Bonuses + dto.CarryOver;
            var freeCash = totalIncome - totalCommitments;
            var spendableCash = freeCash - dto.AllocatedToWishlist;
            var weeklyBudget = spendableCash > 0 ? spendableCash / 4 : 0;

            var snapshot = new MonthlySnapshot
            {
                UserId = userId,
                Year = dto.Year,
                Month = dto.Month,
                Salary = dto.Salary,
                Bonuses = dto.Bonuses,
                CarryOver = dto.CarryOver,
                TotalCommitments = totalCommitments,
                FreeCash = freeCash,
                AllocatedToWishlist = dto.AllocatedToWishlist,
                WeeklyBudget = weeklyBudget,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _snapshotRepository.AddAsync(snapshot);

            // Seed the 4 weekly budget rows
            var weeks = BuildWeekRows(created.SnapshotId, dto.Year, dto.Month, weeklyBudget);
            foreach (var w in weeks)
                await _weeklyBudgetRepository.AddAsync(w);

            return _mapper.Map<MonthlySnapshotDto>(created);
        }

        // ─── Mid-month Replan ────────────────────────────────────────────
        /// <summary>
        /// User declares how much cash they have right now.
        /// The system:
        ///   1. Finds the current week number.
        ///   2. Redistributes cashInHand evenly across remaining weeks.
        ///   3. Records a SnapshotTrigger.
        ///   4. Updates FreeCash + WeeklyBudget on the snapshot.
        /// </summary>
        public async Task<MonthlySnapshotDto?> RePlanAsync(string userId, RePlanDto dto)
        {
            var snapshot = await _snapshotRepository.GetLatestSnapshotAsync(userId)
                ?? throw new InvalidOperationException("No active monthly plan found. Please create one first.");

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Find remaining weeks (WeekEnd >= today)
            var allWeeks = await _weeklyBudgetRepository.GetBySnapshotAsync(snapshot.SnapshotId, userId);
            var remainingWeeks = allWeeks
                .Where(w => w.WeekEnd >= today)
                .OrderBy(w => w.WeekNumber)
                .ToList();

            if (!remainingWeeks.Any())
                throw new InvalidOperationException("No remaining weeks in this plan to redistribute.");

            var newWeeklyAmount = dto.CashInHand / remainingWeeks.Count;

            foreach (var week in remainingWeeks)
            {
                week.BudgetAmount = newWeeklyAmount;
                await _weeklyBudgetRepository.UpdateAsync(week);
            }

            // Update the snapshot's running figures
            snapshot.FreeCash = dto.CashInHand;
            snapshot.WeeklyBudget = newWeeklyAmount;

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

        private async Task<decimal> ComputeTotalCommitmentsAsync(string userId)
        {
            var gameyasPage = await _gameyaRepository.GetActiveByUserAsync(userId,
                new RequestDto<WithOutFilter> { PageNumber = 1, PageSize = 1000 });

            var installmentsPage = await _installmentRepository.GetActiveByUserAsync(userId,
                new RequestDto<WithOutFilter> { PageNumber = 1, PageSize = 1000 });

            var gameyaTotal = gameyasPage.Items.Sum(g => g.MonthlyContribution);
            var installmentTotal = installmentsPage.Items.Sum(i => i.MonthlyAmount);

            return gameyaTotal + installmentTotal;
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

        private async Task<MonthlySnapshotDto> MapToDetailDtoAsync(MonthlySnapshot entity, string userId)
        {
            var dto = _mapper.Map<MonthlySnapshotDto>(entity);

            // Attach weekly budgets with spent amounts
            dto.WeeklyBudgets = entity.WeeklyBudgets
                .OrderBy(w => w.WeekNumber)
                .Select(w =>
                {
                    var wDto = _mapper.Map<WeeklyBudgetDto>(w);
                    wDto.SpentAmount = w.Expenses?.Sum(e => e.Amount) ?? 0m;
                    return wDto;
                }).ToList();

            // Attach wishlist ETA summary
            dto.WishlistSummary = await _wishlistItemService.BuildSummaryAsync(userId);

            return dto;
        }
    }
}
